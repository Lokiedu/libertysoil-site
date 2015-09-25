import {Route} from 'react-router';
import React from 'react';


import App from './pages/app'
import Auth from './pages/auth'
import MaybeList from './pages/maybe_list'
import PostPage from './pages/post'
import UserPage from './pages/user'

let routes = (
  <Route component={App}>
    <Route component={MaybeList} name="post_list" path="/" />
    <Route component={Auth} name="auth" path="/auth" />
    <Route component={PostPage} name="post" path="/post/:uuid" />
    <Route component={UserPage} name="user" path="/user/:username" />
  </Route>
);

export default routes;
