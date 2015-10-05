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
//import multer from 'multer';
import _ from 'lodash';
import bb from 'bluebird';
import session from 'express-session';
import initRedisStore from 'connect-redis';

import React from 'react';
import { renderToString } from 'react-dom/server'
import createMemoryHistory from 'history/lib/createMemoryHistory'
import { Router, RoutingContext, match } from 'react-router'

import Routes from './src/routing';
import ApiController from './src/api/controller';
import initBookshelf from './src/api/db';
import ApiClient from './src/api/client';
import {API_HOST} from './src/config';
import {initState, setCurrentUser, getStore, setPostsToRiver, setLikes} from './src/store';

import db_config from './knexfile';


let exec_env = process.env.DB_ENV || 'development';
const knexConfig = db_config[exec_env];

let bookshelf = initBookshelf(knexConfig);
let controller = new ApiController(bookshelf);

let wrap = fn => (...args) => fn(...args).catch(args[2]);
let app = express();

let RedisStore = initRedisStore(session);

app.use(session({
  store: new RedisStore({
    host: 'localhost',
    port: 6379
  }),
  secret: 'libertysoil',
  resave: false,
  saveUninitialized: false
}));

app.use(bodyParser.urlencoded({ extended: true }));  // for parsing application/x-www-form-urlencoded
//app.use(multer());  // for parsing multipart/form-data

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.set('views', './src/views');
app.set('view engine', 'ejs');

let api = express.Router();

api.get('/test', wrap(controller.test));
api.post('/users', wrap(controller.registerUser.bind(controller)));
api.post('/session', wrap(controller.login.bind(controller)));

api.get('/posts', wrap(controller.subscriptions.bind(controller)));
api.post('/posts', wrap(controller.createPost.bind(controller)));
api.get('/post/:id', wrap(controller.getPost.bind(controller)));
api.post('/post/:id', wrap(controller.updatePost.bind(controller)));
api.delete('/post/:id', wrap(controller.removePost.bind(controller)));
api.post('/post/:id/like', wrap(controller.likePost.bind(controller)));
api.post('/post/:id/unlike', wrap(controller.unlikePost.bind(controller)));

api.get('/posts/all', wrap(controller.allPosts.bind(controller)));
api.get('/posts/user/:user', wrap(controller.userPosts.bind(controller)));

api.get('/user/:username', wrap(controller.getUser.bind(controller)));
api.post('/user/:username/follow', wrap(controller.followUser.bind(controller)));
api.post('/user/:username/unfollow', wrap(controller.unfollowUser.bind(controller)));

api.post('/logout', wrap(controller.logout.bind(controller)));

app.use('/api/v1', api);

app.use(express.static('public', { index: false}));

let reactHandler = async (req, res) => {
  let store = initState();

  if (req.session && req.session.user && _.isString(req.session.user)) {
    try {
      let user = await bookshelf
        .model('User')
        .where({id: req.session.user})
        .fetch({require: true, withRelated: ['following']});

      let data = user.toJSON();

      let likes = await bookshelf.knex
        .select('post_id')
        .from('likes')
        .where({user_id: req.session.user});

      store.dispatch(setCurrentUser(data));
      store.dispatch(setLikes(data.id, likes.map(like => like.post_id)));
    } catch (e) {
      console.log(`dispatch failed: ${e.stack}`);
    }
  }

  const makeRoutes = (history) => (
    <Router history={history}>
      {Routes}
    </Router>
  )

  let history = createMemoryHistory();
  let location = history.createLocation(req.url);
  let routes = makeRoutes(history);

  match({ routes, location }, async (error, redirectLocation, renderProps) => {
    if (redirectLocation) {
      res.redirect(301, redirectLocation.pathname + redirectLocation.search)
    } else if (error) {
      res.status(500).send(error.message)
    } else if (renderProps == null) {
      res.status(404).send('Not found')
    } else {
      if (renderProps.routes[1].name == 'post_list' && 'cookie' in req.headers) {
        let client = new ApiClient(API_HOST, req);

        try {
          let posts = await client.subscriptions();
          getStore().dispatch(setPostsToRiver(posts));
        } catch (e) {
          console.dir(e);
        }
      }

      let html = renderToString(<RoutingContext {...renderProps}/>)
      let state = JSON.stringify(store.getState().toJS());

      res.render('index', { state, html });
    }
  });
};

app.use(wrap(reactHandler));

app.listen(8000);
