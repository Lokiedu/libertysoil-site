import React from 'react';
import { Route, IndexRoute } from 'react-router';

import Main from './pages/Main';
import Editor from './pages/Editor';
import Viewer from './pages/Preview';
import App from './components/App';
import ScreenList from './components/ScreenList';
import ComponentList from './components/ComponentList';
import SingleComponent from './components/SingleComponent';


export const getRoutes = (authHandler, enterHandler, changeHandler) => {
  const withoutAuth = enterHandler;

  return (
    <Route component={App}>
      <Route component={Main} path="/">
        <IndexRoute component={ComponentList} onChange={changeHandler} onEnter={withoutAuth} />
        <Route path="/full-pages/(:name)" component={ScreenList} onChange={changeHandler} onEnter={withoutAuth} />
        <Route path="/components/(:name)" component={ComponentList} onChange={changeHandler} onEnter={withoutAuth} />
        <Route path="/source(/:name)" component={Editor} onChange={changeHandler} onEnter={withoutAuth} />
        <Route path="/preview(/:name)(/:page)" component={Viewer} onChange={changeHandler} onEnter={withoutAuth} />
      </Route>
      <Route path="/component/(:name)" component={SingleComponent} onChange={changeHandler} onEnter={withoutAuth} />
    </Route>
  );
};
