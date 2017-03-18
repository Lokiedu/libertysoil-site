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
import { Map as ImmutableMap, List } from 'immutable';

import * as a from '../actions/posts';

function addPost(state, post) {
  return state.update(post.user_id, List(), river =>
    river.unshift(post.id)
  );
}

function removePost(state, postId, userId) {
  return state.update(userId, List(), river => {
    const index = river.findIndex(id => id === postId);
    if (index >= 0) {
      return river.delete(index);
    }
    return river;
  });
}

export const initialState = ImmutableMap({});

export function reducer(state = initialState, action) {
  switch (action.type) {
    case a.SET_PROFILE_POSTS: {
      const posts = action.payload.posts.map(post => post.id);
      state = state.update(action.payload.userId, List(), river => {
        return river.splice(action.payload.offset, posts.length, ...posts);
      });
      break;
    }
    case a.ADD_PROFILE_POST: {
      state = addPost(state, action.payload.post);
      break;
    }
    case a.REMOVE_PROFILE_POST: {
      state = removePost(state, action.payload.id, action.payload.userId);
      break;
    }
    case a.UPDATE_PROFILE_POST: {
      const post = action.payload.post;
      state = addPost(removePost(state, post.id, post.user_id), post);
      break;
    }
  }

  return state;
}
