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
import _ from 'lodash';

import * as a from '../actions';

const initialState = i.Map({});

function cleanUser(user) {
  return _.omit(user, ['following', 'followers']);
}

function extractAssociations(user) {
  const users = {};

  if (!user) {
    return users;
  }

  if (user.following) {
    for (const followed_user of user.following) {
      users[followed_user.id] = followed_user;
    }

    user = _.cloneDeep(user);
  }

  if (user.followers) {
    for (const follower of user.followers) {
      users[follower.id] = follower;
    }

    user = _.cloneDeep(user);
  }

  users[user.id] = cleanUser(user);

  return users;
}

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case a.users.ADD_USER:
    case a.users.SET_CURRENT_USER: {
      state = state.mergeDeep(i.fromJS(extractAssociations(action.payload.user)));

      if (action.payload.user) {
        if (action.payload.user.more && action.payload.user.more.roles) {
          state = state.setIn([action.payload.user.id, 'more', 'roles'], i.fromJS(action.payload.user.more.roles));
        }
      }

      break;
    }

    case a.users.ADD_USERS: {
      const usersById = action.payload.users.reduce((acc, user) => {
        acc[user.id] = cleanUser(user);
        return acc;
      }, {});
      state = state.mergeDeep(i.fromJS(usersById));

      break;
    }

    case a.posts.ADD_POST:
    case a.posts.CREATE_POST: {
      const user = action.payload.post.user;
      if (!user) {
        // the post hasn't been found; adding a fake
        break;
      }

      const comment_authors = action.payload.post.post_comments.map(comment => comment.user);
      const users = _.keyBy(_.uniqBy([user, ...comment_authors], 'id'), 'id');
      state = state.mergeDeep(i.fromJS(users));

      break;
    }

    case a.allPosts.ADD_POSTS_TO_ALL_POSTS:
    case a.allPosts.SET_ALL_POSTS:
    case a.river.SET_POSTS_TO_RIVER:
    case a.river.SET_POSTS_TO_LIKES_RIVER:
    case a.river.SET_POSTS_TO_FAVOURITES_RIVER:
    case a.schools.SET_SCHOOL_POSTS:
    case a.hashtags.SET_HASHTAG_POSTS:
    case a.geotags.SET_GEOTAG_POSTS: {
      const authors = action.payload.posts.map(post => post.user);
      const comment_authors = _.flatten(action.payload.posts.map(post => post.post_comments.map(comment => comment.user)));
      const users = _.keyBy(_.uniqBy([...authors, ...comment_authors], 'id'), 'id');
      state = state.mergeDeep(i.fromJS(users));

      break;
    }

    case a.comments.SET_POST_COMMENTS: {
      const users = _.keyBy(_.map(action.payload.comments, comment => comment.user), 'id');
      state = state.mergeDeep(i.fromJS(users));

      break;
    }

    case a.posts.SET_RELATED_POSTS: {
      const users = _.keyBy(action.payload.posts.map(post => post.user), 'id');
      state = state.mergeDeep(i.fromJS(users));

      break;
    }
  }

  return state;
}
