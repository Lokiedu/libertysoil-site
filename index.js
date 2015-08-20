import express from 'express';
import ReactDOMServer from 'react-dom/server'
import {Router} from 'react-router';
import MemoryHistory from 'react-router/lib/MemoryHistory';
import React from 'react';

import routes from './src/routing';

let app = express();

//app.engine('html', require('ejs').renderFile);

app.set('views', './src/views');
app.set('view engine', 'ejs');

app.use(express.static('public'));

app.use((req, res, next) => {
  let history = new MemoryHistory([req.url]);

  let html = ReactDOMServer.renderToString(
    <Router history={history}>
      {routes}
    </Router>
  );

  return res.render('index', {html: html});

});


let server = app.listen(8000);
