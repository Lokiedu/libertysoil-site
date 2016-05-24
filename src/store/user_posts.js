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

import * as a from '../actions';

const initialState = i.Map({});

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case a.SET_USER_POSTS: {
      state = state.set(action.user_id, i.List(action.posts.map(post => post.id)));
      break;
    }

    case a.REMOVE_POST: {
      for (const user_id of state.keys()) {
        const idx = state.get(user_id).findIndex(user_post_id => (user_post_id === action.id));

        if (idx >= 0) {
          state = state.deleteIn([user_id, idx]);
        }
      }
      break;
    }
  }

  return state;
}
