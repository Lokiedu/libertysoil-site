import express from 'express';
import ReactDOMServer from 'react-dom/server'
import {Router, createRoutesFromReactChildren, useRoutes} from 'react-router';
import RoutingContext from 'react-router/lib/RoutingContext'
import { createLocation, createMemoryHistory } from 'history'
import React from 'react';
import bodyParser from 'body-parser';
import multer from 'multer';
import request from 'superagent';

import session from 'express-session';
import initRedisStore from 'connect-redis';

import Routes from './src/routing';
import ApiController from './src/api/controller'
import initBookshelf from './src/api/db'
import {API_HOST} from './src/config'
import {initState, setCurrentUser, getStore, setPosts} from './src/store';

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

app.get('/api/v1/test', wrap(controller.test));
app.post('/api/v1/users', wrap(controller.registerUser.bind(controller)))
app.post('/api/v1/session', wrap(controller.login.bind(controller)))
app.get('/api/v1/posts', wrap(controller.posts.bind(controller)));
app.post('/api/v1/posts', wrap(controller.createPost.bind(controller)));

app.use(express.static('public', { index: false}));

app.use((req, res, next) => {
  let store = initState();

  if (req.session && req.session.user) {
    store.dispatch(setCurrentUser(req.session.user));
  }

  let location = createLocation(req.path, req.query)
  let routes = createRoutesFromReactChildren(Routes)
  let history = useRoutes(createMemoryHistory)({ routes })

  history.match(location, (error, initialState)=> {
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

    if (initialState.routes[1].name == 'post_list') {
      request.get(`${API_HOST}/api/v1/posts`).end((err, result) => {
        getStore().dispatch(setPosts(result.body));
        render()
      });
    } else {
      render()
    }
  })
});


let server = app.listen(8000);
