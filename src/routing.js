import {Route} from 'react-router';
import React from 'react';


import App from './pages/app'
import Auth from './pages/auth'
import List from './pages/list'

let routes = (
  <Route component={App}>
    <Route component={List} path="/" />
    <Route component={Auth} path="/auth" />
  </Route>
);

export default routes;
