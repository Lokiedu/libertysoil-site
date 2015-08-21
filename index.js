import express from 'express';
import ReactDOMServer from 'react-dom/server'
import {Router} from 'react-router';
import MemoryHistory from 'react-router/lib/MemoryHistory';
import React from 'react';
import bodyParser from 'body-parser';
import multer from 'multer';

import routes from './src/routing';
import ApiController from './src/api/controller'
import initBookshelf from './src/api/db'

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

app.use(bodyParser.urlencoded({ extended: true }));  // for parsing application/x-www-form-urlencoded
app.use(multer());  // for parsing multipart/form-data

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.set('views', './src/views');
app.set('view engine', 'ejs');

app.get('/api/v1/test', wrap(controller.test));
app.post('/api/v1/users', wrap(controller.registerUser.bind(controller)))
app.get('/api/v1/posts', wrap(controller.posts.bind(controller)));

app.use(express.static('public', { index: false}));
app.use((req, res, next) => {
  let history = new MemoryHistory([req.url]);

  let html = ReactDOMServer.renderToString(
    <Router history={history}>
      {routes}
    </Router>
  );

  return res.render('index', {
    html: html
  });
});


let server = app.listen(8000);
