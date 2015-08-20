import express from 'express';
import ReactDOMServer from 'react-dom/server'
import {Router} from 'react-router';
import MemoryHistory from 'react-router/lib/MemoryHistory';
import React from 'react';

import routes from './src/routing';
import ApiController from './src/api/controller'

let wrap = fn => (...args) => fn(...args).catch(args[2]);
let app = express();

//app.engine('html', require('ejs').renderFile);

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.set('views', './src/views');
app.set('view engine', 'ejs');

let controller = new ApiController();
app.get('/api/v1/test', wrap(controller.test));
app.get('/api/v1/posts', wrap(controller.posts));

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
