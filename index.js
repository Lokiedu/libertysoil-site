import express from 'express';
import ReactDOMServer from 'react-dom/server'
import {Router, createRoutesFromReactChildren, useRoutes} from 'react-router';
import RoutingContext from 'react-router/lib/RoutingContext'
import { createLocation, createMemoryHistory } from 'history'
import React from 'react';
import bodyParser from 'body-parser';
import multer from 'multer';
import request from 'superagent';
import _ from 'lodash'
import bb from 'bluebird'

import session from 'express-session';
import initRedisStore from 'connect-redis';

import Routes from './src/routing';
import ApiController from './src/api/controller'
import initBookshelf from './src/api/db'
import {API_HOST} from './src/config'
import {initState, setCurrentUser, getStore, setPostsToRiver, setLikes} from './src/store';

const knexConfig = {
  client: 'pg',
  connection: {
    host     : '127.0.0.1',
    user     : 'libertysoil',
    password : 'libertysoil',
    database : 'libertysoil',
    charset  : 'utf8'
  }
};

let bookshelf = initBookshelf(knexConfig)
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
api.get('/post/:id', wrap(controller.getPost.bind(controller)));

api.get('/posts/all', wrap(controller.allPosts.bind(controller)));
api.get('/posts/user/:user', wrap(controller.userPosts.bind(controller)));

api.post('/posts', wrap(controller.createPost.bind(controller)));
api.get('/user/:username', wrap(controller.getUser.bind(controller)));
api.post('/user/:username/follow', wrap(controller.followUser.bind(controller)));
api.post('/user/:username/unfollow', wrap(controller.unfollowUser.bind(controller)));

api.post('/logout', wrap(controller.logout.bind(controller)));

app.use('/api/v1', api);

app.use(express.static('public', { index: false}));

let reactHandler = async (req, res, next) => {
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
      console.log(`dispatch failed: ${e.stack}`)
    }
  }

  let location = createLocation(req.path, req.query)
  let routes = createRoutesFromReactChildren(Routes)
  let history = useRoutes(createMemoryHistory)({ routes })

  let history_match = bb.promisify(history.match);

  let initialState = await history_match(location)

  if (null === initialState) {
    next();
    return;
  }

  function render() {
    let html = ReactDOMServer.renderToString(
      <RoutingContext history={history} {...initialState}/>
    );

    let state = JSON.stringify(store.getState().toJS());

    res.render('index', { state, html });
  }

  if (initialState.routes[1].name == 'post_list' && 'cookie' in req.headers) {
    let promise = Promise.resolve(request
      .get(`${API_HOST}/api/v1/posts`)
      .set('Cookie', req.headers['cookie']));

    try {
      let result = await promise;
      getStore().dispatch(setPostsToRiver(result.body));
    } catch (e) {
      console.dir(e)
    }
  }

  render();
};

app.use(wrap(reactHandler));


let server = app.listen(8000);
