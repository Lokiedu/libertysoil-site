import {Route} from 'react-router';
import React from 'react';


import App from './pages/app'
import Index from './pages/index'
import List from './pages/list'

let routes = (
    <Route component={App}>
      <Route component={Index} path="/" />
      <Route component={List} path="/list" />
    </Route>
);

export default routes;
