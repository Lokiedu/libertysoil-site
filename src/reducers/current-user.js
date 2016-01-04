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


const initialState = i.Map({
  id: null,
  tags: i.List([])
});

export default function reducer(state=initialState, action) {
  switch (action.type) {
    case a.SET_CURRENT_USER:
    {
      const oldUid = state.get('id');

      if (oldUid === action.user.id) {
        break;
      }

      state = state.withMutations(function (state) {
        state
          .set('id', action.user.id)
          .set('tags', i.List([]))
          .set('followed_tags', i.Map({}));
      });

      break;
    }

    case a.SET_USER_TAGS: {
      let tags = _.take(action.tags, 10);

      if (tags)
        state = state.set('tags', i.fromJS(tags));
      else
        state = state.set('tags', i.List([]));

      break;
    }

    case a.SET_USER_FOLLOWED_TAGS: {
      let followedTags = action.followed_tags.reduce(function (tags, tag) {
        tags[tag.name] = tag;
        return tags;
      }, {});

      state = state.set('followed_tags', i.fromJS(followedTags));

      break;
    }

    case a.ADD_USER_FOLLOWED_TAG: {
      state = state.setIn(['followed_tags', action.tag.name], i.fromJS(action.tag));

      break;
    }

    case a.REMOVE_USER_FOLLOWED_TAG: {
      state = state.deleteIn(['followed_tags', action.tag.name]);

      break;
    }

    case a.SET_USER_FOLLOWED_SCHOOLS: {
      let followedSchools = action.followed_schools.reduce(function (schools, school) {
        schools[school.url_name] = school;
        return schools;
      }, {});

      state = state.set('followed_schools', i.fromJS(followedSchools));

      break;
    }

    case a.ADD_USER_FOLLOWED_SCHOOL: {
      state = state.setIn(['followed_schools', action.school.url_name], i.fromJS(action.school));

      break;
    }

    case a.REMOVE_USER_FOLLOWED_SCHOOL: {
      state = state.deleteIn(['followed_schools', action.school.url_name]);

      break;
    }
  }

  return state;
}
