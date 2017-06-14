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

import { river } from '../actions';

export const initialState = i.fromJS({
  hashtag_subscriptions_river: [],
  school_subscriptions_river: [],
  geotag_subscriptions_river: [],
});

function updateRiver(state, action, key) {
  const postIds = action.payload.posts.map(post => post.id);
  const offset = action.meta.offset;

  if (offset === 0) {
    return state.set(key, i.List(postIds));
  }

  return state.update(key, river => {
    return river.splice(offset, 0, ...postIds);
  });
}

export function reducer(state = initialState, action) {
  switch (action.type) {
    case river.LOAD_HASHTAG_SUBSCRIPTONS_RIVER: {
      state = updateRiver(state, action, 'hashtag_subscriptions_river');
      break;
    }

    case river.LOAD_SCHOOL_SUBSCRIPTONS_RIVER: {
      state = updateRiver(state, action, 'school_subscriptions_river');
      break;
    }

    case river.LOAD_GEOTAG_SUBSCRIPTONS_RIVER: {
      state = updateRiver(state, action, 'geotag_subscriptions_river');
      break;
    }
  }

  return state;
}

