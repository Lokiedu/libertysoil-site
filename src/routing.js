import {Route} from 'react-router';
import React from 'react';


import App from './pages/app'
import Auth from './pages/auth'
import MaybeList from './pages/maybe_list'

let routes = (
  <Route component={App}>
    <Route component={MaybeList} name="post_list" path="/" />
    <Route component={Auth} name="auth" path="/auth" />
  </Route>
);

export default routes;
