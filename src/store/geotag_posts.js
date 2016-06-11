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

import * as a from '../actions';

const initialState = i.Map({});

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case a.river.ADD_POST_TO_RIVER: {
      const geotags = action.post.geotags;

      geotags.forEach(tag => {
        let posts = i.List([]);
        if (state.get(tag.name)) {
          posts = state.get(tag.name);
        }
        posts = posts.unshift(action.post.id);

        state = state.set(tag.name, posts);
      });
      break;
    }

    case a.geotags.SET_GEOTAG_POSTS: {
      state = state.set(action.geotag, i.List(action.posts.map(post => post.id)));
      break;
    }

    case a.REMOVE_POST: {
      for (const geotagName of state.keys()) {
        const idx = state.get(geotagName).findIndex(geotagPostId => (geotagPostId === action.id));

        if (idx >= 0) {
          state = state.deleteIn([geotagName, idx]);
        }
      }
      break;
    }
  }

  return state;
}
