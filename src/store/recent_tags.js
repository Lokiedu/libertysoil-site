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
import { map } from 'lodash';
import { recentTags } from '../actions';

export const initialState = i.fromJS({
  hashtags: {
    entries: [],
    post_count: null
  },
  schools: {
    entries: [],
    post_count: null
  },
  geotags: {
    entries: [],
    post_count: null
  }
});

export function reducer(state = initialState, action) {
  switch (action.type) {
    case recentTags.SET_RECENT_TAGS: {
      const tags = {};

      if (action.payload.hashtags) {
        tags.hashtags = {
          entries: map(action.payload.hashtags.entries, 'name'),
          post_count: action.payload.hashtags.post_count
        };
      }

      if (action.payload.schools) {
        tags.schools = {
          entries: map(action.payload.schools.entries, 'id'),
          post_count: action.payload.schools.post_count
        };
      }

      if (action.payload.geotags) {
        tags.geotags = {
          entries: map(action.payload.geotags.entries, 'url_name'),
          post_count: action.payload.geotags.post_count
        };
      }

      state = state.merge(i.fromJS(tags));

      break;
    }
  }

  return state;
}
