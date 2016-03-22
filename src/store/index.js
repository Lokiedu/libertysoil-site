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
import { routerReducer } from 'react-router-redux';

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
import * as ui from './ui';
import tag_cloud from './tag_cloud';
import school_cloud from './school_cloud';
import geotag_posts from './geotag_posts';
import geotags from './geotags';
import edit_post_form from './edit_post_form';
import related_posts from './related_posts';

let store;

export const theReducer = combineReducers(i.Map({
  routing: routerReducer,
  current_user,
  create_post_form,
  edit_post_form,
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
  ui: ui.reducer,
  tag_cloud,
  school_cloud,
  related_posts
}));

const initialState = i.Map({
  current_user: i.Map({
    id: null,
    hashtags: i.List([]),
    followed_hashtags: i.Map({}),
    followed_schools: i.Map({}),
    followed_geotags: i.Map({}),
    liked_hashtags: i.Map({}),
    liked_schools: i.Map({}),
    liked_geotags: i.Map({}),
    suggested_users: i.List([]),
    recent_tags: i.Map({
      hashtags: i.List([]),
      schools: i.List([]),
      geotags: i.List([])
    })
  }),
  create_post_form: i.fromJS({
    text: '',
    geotags: [],
    schools: [],
    hashtags: []
  }),
  edit_post_form: i.fromJS({
    id: null,
    geotags: [],
    schools: [],
    hashtags: []
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
  geotags: i.Map({}),
  geotag_posts: i.Map({}),
  likes: i.Map({}),
  likes_river: i.Map({}),
  messages: i.List([]),
  posts: i.Map({}),
  related_posts: i.Map({}),
  river: i.List([]),
  schools: i.Map({}),
  school_posts: i.Map({}),
  suggested_users: i.List([]),
  tag_cloud: i.List([]),
  school_cloud: i.List([]),
  tag_posts: i.Map({}),
  user_posts: i.Map({}),
  users: i.Map({}),
  ui: ui.initialState
});

const browserHasDevTools = typeof window === 'object' && typeof window.devToolsExtension !== 'undefined';
const finalCreateStore = compose(
  browserHasDevTools ? window.devToolsExtension() : f => f
)(createStore);

export function initState(state=initialState) {
  store = finalCreateStore(theReducer, i.fromJS(state));
  return store;
}
