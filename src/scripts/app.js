/*
 This file is a part of libertysoil.org website
 Copyright (C) 2015  Loki Education (Social Enterprise)

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU Affero General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import bluebird from 'bluebird';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { Router, browserHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
import t from 't8on';

import { getRoutes } from '../routing';
import { isStorageAvailable } from '../utils/browser';
import { AuthHandler, FetchHandler } from '../utils/loader';
import { API_HOST } from '../config';
import ApiClient from '../api/client';
import { ActionsTrigger } from '../triggers';
import { initState } from '../store';
import { addMessage } from '../actions/messages';

import '../less/styles.less';

window.Promise = bluebird;

if (typeof window !== 'undefined') {
  if (typeof window.requestAnimationFrame === 'undefined') {
    window.requestAnimationFrame = (callback) => {
      setImmediate(callback);
    };
  }
}

const store = initState(window.state);
const history = syncHistoryWithStore(browserHistory, store, { selectLocationState: state => state.get('routing') });

const client = new ApiClient(API_HOST);

const canUseStorage = isStorageAvailable('localStorage');
const cachedLocale = canUseStorage && window.localStorage.getItem('locale');
const is_logged_in = store.getState().getIn(['current_user', 'id']);

if (typeof window.localization === 'object') {
  if (!is_logged_in && cachedLocale && !Object.keys(window.localization).includes(cachedLocale)) {
    (new ActionsTrigger(client, store.dispatch)).setLocale(cachedLocale);
  } else {
    t.loadRoot(window.localization);
    t.currentLocale = store.getState().getIn(['ui', 'locale']);

    if (canUseStorage) {
      window.localStorage.setItem('locale', t.currentLocale);
    }
  }
}

if (!is_logged_in) {
  store.dispatch(addMessage('welcome-guest'));
}

const authHandler = new AuthHandler(store);
const fetchHandler = new FetchHandler(store, client);

ReactDOM.hydrate(
  <Provider store={store}>
    <Router history={history}>
      {getRoutes(authHandler.handle, fetchHandler.handle, fetchHandler.handleChange)}
    </Router>
  </Provider>,
  document.getElementById('content')
);
