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
import { fromJS, Map } from 'immutable';
import { keyBy } from 'lodash';

import { hashtags as h, recentTags, users } from '../actions';

const initialState = Map({});

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case h.ADD_HASHTAG:
    case h.ADD_LIKED_HASHTAG:
    case h.ADD_USER_FOLLOWED_HASHTAG: {
      const hashtag = action.payload.hashtag;
      state = state.set(hashtag.name, fromJS(hashtag));

      break;
    }

    case recentTags.SET_RECENT_TAGS:
    case h.SET_HASHTAGS: {
      const hashtags = keyBy(action.payload.hashtags, 'name');
      state = state.merge(fromJS(hashtags));

      break;
    }

    case users.SET_CURRENT_USER: {
      if (!action.payload.user) {
        break;
      }

      const hashtags = keyBy(
        action.payload.user.followed_hashtags
          .concat(action.payload.user.liked_hashtags),
        'name'
      );
      state = state.merge(fromJS(hashtags));

      break;
    }
  }

  return state;
}
