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
import { Map as iMap } from 'immutable';
import { createStore } from 'redux';
import { combineReducers } from 'redux-immutablejs'

import current_user from './current-user';
import favourites from './favourites';
import followers from './followers';
import following from './following';
import likes from './likes';
import likes_river from './likes_river';
import messages from './messages';
import posts from './posts';
import river from './river';
import schools from './schools';
import tag_posts from './tag_posts';
import user_posts from './user_posts';
import users from './users';


let store;

const theReducer = combineReducers({
  current_user,
  favourites,
  followers,
  following,
  likes,
  likes_river,
  messages,
  posts,
  river,
  schools,
  tag_posts,
  user_posts,
  users
});

const initialState = iMap({});

export function initState(state=initialState) {
  store = createStore(theReducer, state);
  return store;
}

export function getStore() {
  return store;
}
