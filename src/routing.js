import {Route} from 'react-router';
import React from 'react';


import App from './components/app'
import Index from './components/index'

let routes = (
    <Route component={App}>
      <Route component={Index} name="index" path="/" />
    </Route>
);

export default routes;
