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
import _ from 'lodash';

import * as a from '../actions';


const initialState = i.Map({});

const cleanUser = user => {
  let users = {};

  if (!user) {

    return users;
  }

  if (user.following) {
    for (let followed_user of user.following) {
      users[followed_user.id] = followed_user;
    }

    user = _.cloneDeep(user);
    delete user.following;
  }

  if (user.followers) {
    for (let follower of user.followers) {
      users[follower.id] = follower;
    }

    user = _.cloneDeep(user);
    delete user.following;
  }

  users[user.id] = user;

  return users;
};

export default function reducer(state=initialState, action) {
  switch (action.type) {
    case a.ADD_USER:
    case a.SET_CURRENT_USER:
    {
      state = state.merge(i.fromJS(cleanUser(action.user)));

      break;
    }

    case a.ADD_POST:
    case a.ADD_POST_TO_RIVER: {
      const user = action.post.user;
      state = state.set(user.id, i.fromJS(user));

      break;
    }

    case a.SET_POSTS_TO_RIVER:
    case a.SET_POSTS_TO_LIKES_RIVER:
    case a.SET_POSTS_TO_FAVOURITES_RIVER:
    case a.SET_SCHOOL_POSTS:
    case a.SET_TAG_POSTS:
    case a.SET_GEOTAG_POSTS:
    {
      let users = _.indexBy(_.unique(action.posts.map(post => post.user), 'id'), 'id');
      state = state.mergeDeep(i.fromJS(users));
    }
  }

  return state;
}
