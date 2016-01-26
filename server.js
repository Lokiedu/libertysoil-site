/*
 This file is a part of libertysoil.org website
 Copyright (C) 2015  Loki Education (Social Enterprise)

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU Affero General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import express from 'express';
import bodyParser from 'body-parser';
import _ from 'lodash';
import session from 'express-session';
import initRedisStore from 'connect-redis';
import knexLogger from 'knex-logger';
import chokidar from 'chokidar';

import React from 'react';
import { renderToString } from 'react-dom/server'
import createMemoryHistory from 'history/lib/createMemoryHistory'
import { Router, RoutingContext, match } from 'react-router'
import { syncReduxAndRouter } from 'redux-simple-router';
import { Provider } from 'react-redux';

import { getRoutes } from './src/routing';
import { AuthHandler, FetchHandler } from './src/utils/loader';
import {initApi} from './src/api/routing'
import initBookshelf from './src/api/db';
import {API_HOST} from './src/config';
import ApiClient from './src/api/client'

import { initState } from './src/store';
import {
  setCurrentUser, setLikes, setFavourites, setUserFollowedTags,
  setUserFollowedSchools, setUserFollowedGeotags
} from './src/actions';

import db_config from './knexfile';


let wrap = fn => (...args) => fn(...args).catch(args[2]);

let RedisStore = initRedisStore(session);

let sessionMiddleware = session({
  store: new RedisStore({
    host: '127.0.0.1',
    port: 6379
  }),
  secret: 'libertysoil',
  resave: false,
  saveUninitialized: false
});

let corsMiddleware = (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
};


let exec_env = process.env.DB_ENV || 'development';
const knexConfig = db_config[exec_env];
let bookshelf = initBookshelf(knexConfig);
let api = initApi(bookshelf)

let reactHandler = async (req, res) => {
  let store = initState();

  if (req.session && req.session.user && _.isString(req.session.user)) {
    try {
      let user = await bookshelf
        .model('User')
        .where({id: req.session.user})
        .fetch({require: true, withRelated: ['following', 'followed_labels', 'followed_schools', 'followed_geotags']});

      let data = user.toJSON();

      let likes = await bookshelf.knex
        .select('post_id')
        .from('likes')
        .where({user_id: req.session.user});

      let favourites = await bookshelf.knex
        .select('post_id')
        .from('favourites')
        .where({user_id: req.session.user});

      store.dispatch(setCurrentUser(data));
      store.dispatch(setLikes(data.id, likes.map(like => like.post_id)));
      store.dispatch(setFavourites(data.id, favourites.map(fav => fav.post_id)));
      store.dispatch(setUserFollowedTags(data.followed_labels));
      store.dispatch(setUserFollowedSchools(data.followed_schools));
      store.dispatch(setUserFollowedGeotags(data.followed_geotags));
    } catch (e) {
      console.log(`dispatch failed: ${e.stack}`);
    }
  }

  const authHandler = new AuthHandler(store);
  const fetchHandler = new FetchHandler(store, new ApiClient(API_HOST, req));
  const Routes = getRoutes(authHandler.handle, fetchHandler.handleSynchronously);

  const makeRoutes = (history) => (
    <Router history={history}>
      {Routes}
    </Router>
  );

  let history = createMemoryHistory();
  let location = history.createLocation(req.url);
  let routes = makeRoutes(history);

  syncReduxAndRouter(history, store, state => state.get('routing'));

  match({ routes, location }, (error, redirectLocation, renderProps) => {
    if (redirectLocation) {
      res.redirect(307, redirectLocation.pathname + redirectLocation.search)
      return;
    }

    if (error) {
      res.status(500).send(error.message)
      return;
    }

    if (renderProps == null) {
      res.status(404).send('Not found')
      return;
    }

    if (fetchHandler.redirectTo !== null) {
      res.redirect(fetchHandler.status, fetchHandler.redirectTo);
      return;
    }

    try {
      let html = renderToString(
        <Provider store={store}>
          <RoutingContext {...renderProps}/>
        </Provider>
      );
      let state = JSON.stringify(store.getState().toJS());

      if (fetchHandler.status !== null) {
        res.status(fetchHandler.status);
      }

      res.render('index', { state, html });
    } catch (e) {
      console.error(e.stack);
      res.status(500).send(e.message)
    }
  });
};


let app = express();

if (process.env.NODE_ENV == 'development') {
  var webpack = require('webpack');
  var webpackConfig = require('./webpack.dev.config');
  var compiler = webpack(webpackConfig);

  app.use(require('webpack-dev-middleware')(compiler, {
    log: console.log,
    path: '/__webpack_hmr',
    publicPath: webpackConfig.output.publicPath,
    stats: {
      colors: true
    }
  }));
  app.use(require('webpack-hot-middleware')(compiler));

  // Taken from https://github.com/glenjamin/ultimate-hot-reloading-example/blob/master/server.js

  // Do "hot-reloading" of express stuff on the server
  // Throw away cached modules and re-require next time
  // Ensure there's no important state in there!
  var watcher = chokidar.watch('./src/api');
  watcher.on('ready', function () {
    watcher.on('all', function () {
      console.log("Clearing /src/api/ cache from server");
      Object.keys(require.cache).forEach(function (id) {
        if (/\/src\/api\//.test(id)) delete require.cache[id];
      });
    });
  });

  // Do "hot-reloading" of react stuff on the server
  // Throw away the cached client modules and let them be re-required next time
  compiler.plugin('done', function () {
    console.log("Clearing /src/ cache from server");
    Object.keys(require.cache).forEach(function (id) {
      if (/\/src\//.test(id)) delete require.cache[id];
    });
  });

  app.use(knexLogger(bookshelf.knex));
}

app.set('views', './src/views');
app.set('view engine', 'ejs');

app.use(sessionMiddleware);
app.use(bodyParser.urlencoded({ extended: true }));  // for parsing application/x-www-form-urlencoded
app.use(bodyParser.json());  // for parsing application/json
app.use(corsMiddleware);

app.use('/api/v1', api);
app.use(express.static('public', { index: false}));
app.use(wrap(reactHandler));

export default app;
