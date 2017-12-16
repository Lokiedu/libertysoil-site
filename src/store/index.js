/*
 This file is a part of libertysoil.org website
 Copyright (C) 2016  Loki Education (Social Enterprise)

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
import { compose, createStore, applyMiddleware } from 'redux';
import { combineReducers } from 'redux-immutablejs';
import { browserHistory } from 'react-router';
import { routerReducer, routerMiddleware } from 'react-router-redux';

import { convert } from '../utils/store';

import current_user, { initialState as currentUserInitialState } from './current-user';
import create_post_form from './create_post_form';
import favourites from './favourites';
import favourites_river from './favourites_river';
import followers from './followers';
import following from './following';
import geo from './geo';
import likes from './likes';
import likes_river from './likes_river';
import * as messages from './messages';
import posts from './posts';
import river from './river';
import all_posts from './all_posts';
import most_liked_posts from './most_liked_posts';
import most_favourited_posts from './most_favourited_posts';
import best_posts from './best_posts';
import schools from './schools';
import school_posts from './school_posts';
import hashtags from './hashtags';
import tag_posts from './tag_posts';
import user_posts from './user_posts';
import users from './users';
import suggested_users from './suggested_users';
import * as ui from './ui';
import tag_cloud from './tag_cloud';
import school_cloud from './school_cloud';
import geotag_cloud from './geotag_cloud';
import geotag_posts from './geotag_posts';
import geotags from './geotags';
import edit_post_form from './edit_post_form';
import related_posts from './related_posts';
import comments from './comments';
import quotes from './quotes';
import * as search from './search';
import * as tools from './tools';
import * as user_messages from './user_messages';
import * as profile_posts from './profile_posts';
import * as continent_nav from './continent_nav';
import * as tag_subscriptions from './tag_subscriptions';
import * as recent_tags from './recent_tags';


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
  messages: messages.reducer,
  posts,
  river,
  all_posts,
  most_liked_posts,
  most_favourited_posts,
  best_posts,
  schools,
  school_posts,
  hashtags,
  tag_posts,
  geotags,
  geotag_posts,
  user_posts,
  users,
  suggested_users,
  ui: ui.reducer,
  tag_cloud,
  school_cloud,
  geotag_cloud,
  related_posts,
  comments,
  quotes,
  search: search.reducer,
  continent_nav: continent_nav.reducer,
  tools: tools.reducer,
  user_messages: user_messages.reducer,
  profile_posts: profile_posts.reducer,
  tag_subscriptions: tag_subscriptions.reducer,
  recent_tags: recent_tags.reducer
}));

const initialState = i.Map({
  current_user: currentUserInitialState,
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
  messages: messages.initialState,
  posts: i.Map({}),
  related_posts: i.Map({}),
  river: i.List([]),
  all_posts: i.List([]),
  most_liked_posts: i.List([]),
  most_favourited_posts: i.List([]),
  best_post: i.List([]),
  schools: i.Map({}),
  school_posts: i.Map({}),
  suggested_users: i.List([]),
  tag_cloud: i.List([]),
  school_cloud: i.List([]),
  geotag_cloud: i.List([]),
  hashtags: i.Map({}),
  tag_posts: i.Map({}),
  user_posts: i.Map({}),
  users: i.Map({}),
  ui: ui.initialState,
  quotes: i.List([]),
  search: search.initialState,
  tools: tools.initialState,
  user_messages: user_messages.initialState,
  profile_posts: profile_posts.initialState,
  continent_nav: continent_nav.initialState,
  tag_subscriptions: tag_subscriptions.initialState,
  recent_tags: recent_tags.initialState
});

const browserHasDevTools = typeof window === 'object' && typeof window.devToolsExtension !== 'undefined';

export function initState(state = initialState) {
  const store = createStore(
    theReducer,
    i.fromJS(state).withMutations(convert),
    compose(
      applyMiddleware(routerMiddleware(browserHistory)),
      browserHasDevTools ? window.devToolsExtension() : f => f
    )
  );
  return store;
}
