import express from 'express';
import ReactDOMServer from 'react-dom/server'
import {Router} from 'react-router';
import MemoryHistory from 'react-router/lib/MemoryHistory';
import React from 'react';

import routes from './routing';

let app = express();

//app.engine('html', require('ejs').renderFile);
//app.set('view engine', 'html');

app.use(function (req, res, next) {
  let history = new MemoryHistory([req.url]);

  let html = ReactDOMServer.renderToString(
    <Router history={history}>
      {routes}
    </Router>
  );

  return res.send(html);

  /*var router = Router.create({location: req.url, routes: routes})
   router.run(function(Handler, state) {
   var html = ReactDOMServer.renderToString(<Handler/>)
   return res.render('react_page', {html: html})
   })*/
});


let server = app.listen(8000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});
