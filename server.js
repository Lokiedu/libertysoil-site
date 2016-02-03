import path from 'path';
import fs from 'fs';
import _ from 'lodash';
import Koa from 'koa';
import session from 'koa-generic-session';
import redisStore from 'koa-redis';
import convert from 'koa-convert';
import cors from 'kcors';
import serve from 'koa-static';
import bodyParser from 'koa-bodyparser';
import mount from 'koa-mount';
import ejs from 'ejs';
import chokidar from 'chokidar';

import React from 'react';
import { renderToString } from 'react-dom/server'
import createMemoryHistory from 'history/lib/createMemoryHistory'
import { Router as ReactRouter, RoutingContext, match } from 'react-router'
import { syncReduxAndRouter } from 'redux-simple-router';
import { Provider } from 'react-redux';

import initBookshelf from './src/api/db';
import dbConfig from './knexfile';
import { getRoutes } from './src/routing';
import { AuthHandler, FetchHandler } from './src/utils/loader';
import { initApi } from './src/api/routing'
import { API_HOST } from './src/config';
import ApiClient from './src/api/client'
import { initState } from './src/store';
import {
  setCurrentUser, setLikes, setFavourites, setUserFollowedTags,
  setUserFollowedSchools, setUserFollowedGeotags
} from './src/actions';


let app = new Koa();

let dbEnv = process.env.DB_ENV || 'development';
let knexConfig = dbConfig[dbEnv];
let bookshelf = initBookshelf(knexConfig);
let api = initApi(bookshelf);

let templatePath = path.join(__dirname, '/src/views/index.ejs');
let template = ejs.compile(fs.readFileSync(templatePath, 'utf8'), {filename: templatePath});

if (process.env.NODE_ENV == 'development') {
  let webpackDevMiddleware = require('webpack-koa-dev-middleware').default;
  let webpackHotMiddleware = require('webpack-koa-hot-middleware').default;
  let webpack = require('webpack');
  let webpackConfig = require('./webpack.dev.config');
  let compiler = webpack(webpackConfig);

  app.use(convert(webpackDevMiddleware(compiler, {
    log: console.log,
    path: '/__webpack_hmr',
    publicPath: webpackConfig.output.publicPath,
    stats: {
      colors: true
    }
  })));
  app.use(convert(webpackHotMiddleware(compiler)));

  // Taken from https://github.com/glenjamin/ultimate-hot-reloading-example/blob/master/server.js

  // Do "hot-reloading" of express stuff on the server
  // Throw away cached modules and re-require next time
  // Ensure there's no important state in there!
  var watcher = chokidar.watch('./src/api');
  watcher.on('ready', function () {
    watcher.on('all', function () {
      console.log('Clearing /src/api/ cache from server');
      Object.keys(require.cache).forEach(function (id) {
        if (/\/src\/api\//.test(id)) delete require.cache[id];
      });
    });
  });

  // Do "hot-reloading" of react stuff on the server
  // Throw away the cached client modules and let them be re-required next time
  compiler.plugin('done', function () {
    console.log('Clearing /src/ cache from server');
    Object.keys(require.cache).forEach(function (id) {
        if (/\/src\//.test(id)) delete require.cache[id];
      });
  });
}

app.use(convert(cors({
  allowHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept']
})));

app.use(bodyParser());

app.keys = ['libertysoil'];
app.use(convert(session({
  store: redisStore({
    host: '127.0.0.1',
    port: 6379
  })
})));

app.use(mount('/api/v1', api));

app.use(convert(serve('public/')));

app.use(async function reactMiddleware(ctx) {
  let store = initState();

  if (ctx.session && ctx.session.user && _.isString(ctx.session.user)) {
    try {
      let user = await bookshelf
        .model('User')
        .where({id: ctx.session.user})
        .fetch({require: true, withRelated: ['following', 'followed_labels', 'followed_schools', 'followed_geotags']});

      let data = user.toJSON();

      let likes = await bookshelf.knex
        .select('post_id')
        .from('likes')
        .where({user_id: ctx.session.user});

      let favourites = await bookshelf.knex
        .select('post_id')
        .from('favourites')
        .where({user_id: ctx.session.user});

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
  const fetchHandler = new FetchHandler(store, new ApiClient(API_HOST, ctx));
  const Routes = getRoutes(authHandler.handle, fetchHandler.handleSynchronously);

  let history = createMemoryHistory();
  let location = history.createLocation(ctx.url);
  let routes = (
    <ReactRouter history={history}>
      {Routes}
    </ReactRouter>
  );

  syncReduxAndRouter(history, store, state => state.get('routing'));

  match({ routes, location }, (error, redirectLocation, renderProps) => {
    if (redirectLocation) {
      ctx.status = 307;
      ctx.redirect(redirectLocation.pathname + redirectLocation.search);
      return;
    }

    if (error) {
      ctx.throw(500, error.message);
      return;
    }

    if (renderProps == null) {
      ctx.throw(404, 'Not found');
      return;
    }

    if (fetchHandler.redirectTo !== null) {
      ctx.status = fetchHandler.status;
      ctx.redirect(fetchHandler.redirectTo);
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
        ctx.status = fetchHandler.status;
      }

      ctx.body = template({state, html});
    } catch (e) {
      console.error(e.stack);
      ctx.throw(500, e.message);
    }
  });
});


export default app;
