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
import i from 'immutable';
import { compose, createStore } from 'redux';
import { combineReducers } from 'redux-immutablejs'
import { routeReducer } from 'redux-simple-router';

import current_user from './current-user';
import create_post_form from './create_post_form';
import favourites from './favourites';
import favourites_river from './favourites_river';
import followers from './followers';
import following from './following';
import geo from './geo';
import likes from './likes';
import likes_river from './likes_river';
import messages from './messages';
import posts from './posts';
import river from './river';
import schools from './schools';
import school_posts from './school_posts';
import tag_posts from './tag_posts';
import user_posts from './user_posts';
import users from './users';
import suggested_users from './suggested_users';
import ui from './ui';
import tag_cloud from './tag_cloud';
import geotag_posts from './geotag_posts';
import geotags from './geotags';

let store;

export const theReducer = combineReducers(i.Map({
  routing: routeReducer,
  current_user,
  create_post_form,
  favourites,
  favourites_river,
  followers,
  following,
  geo,
  likes,
  likes_river,
  messages,
  posts,
  river,
  schools,
  school_posts,
  tag_posts,
  geotags,
  geotag_posts,
  user_posts,
  users,
  suggested_users,
  ui,
  tag_cloud
}));

const initialState = i.Map({
  current_user: i.Map({
    id: null,
    tags: i.List([]),
    followed_tags: i.Map({}),
    followed_schools: i.Map({}),
    suggested_users: i.List([])
  }),
  create_post_form: i.fromJS({
    text: '',
    geotags: [],
    schools: [],
    tags: []
  }),
  favourites: i.Map({}),
  favourites_river: i.Map({}),
  followers: i.Map({}),
  following: i.Map({}),
  geo: i.Map({
    cities: i.Map({}),    // index by numeric id
    cityPosts: i.Map({}),
    countries: i.Map({}),  // index by ISO-code
    countryPosts: i.Map({})
  }),
  likes: i.Map({}),
  likes_river: i.Map({}),
  messages: i.List([]),
  posts: i.Map({}),
  river: i.List([]),
  schools: i.Map({}),
  school_posts: i.Map({}),
  tag_posts: i.Map({}),
  geotags: i.Map({}),
  geotag_posts: i.Map({}),
  user_posts: i.Map({}),
  users: i.Map({}),
  suggested_users: i.List([]),
  tag_cloud: i.List([])
});

const browserHasDevTools = typeof window === 'object' && typeof window.devToolsExtension !== 'undefined';
const finalCreateStore = compose(
   browserHasDevTools ? window.devToolsExtension() : f => f
)(createStore);


export function initState(state=initialState) {
  store = finalCreateStore(theReducer, i.fromJS(state));
  return store;
}
