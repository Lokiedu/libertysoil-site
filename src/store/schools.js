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

import { schools as s, recentTags, users } from '../actions';

function cleanupSchoolObject(school) {
  if (school.description === null) {
    school.description = '';
  }

  if (school.lat === null) {
    school.lat = 0.0;
  }

  if (school.lon === null) {
    school.lon = 0.0;
  }

  return school;
}

const initialState = Map({});

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case s.ADD_SCHOOL:
    case s.ADD_LIKED_SCHOOL:
    case s.ADD_USER_FOLLOWED_SCHOOL: {
      const school = cleanupSchoolObject(action.payload.school);
      state = state.set(school.id, fromJS(school));

      break;
    }

    case s.SET_SCHOOLS: {
      const schools = keyBy(action.payload.schools.map(school => cleanupSchoolObject(school)), 'id');
      state = state.merge(fromJS(schools));

      break;
    }

    case recentTags.SET_RECENT_TAGS: {
      const schools = keyBy(action.payload.schools.entries.map(school => cleanupSchoolObject(school)), 'id');
      state = state.merge(fromJS(schools));

      break;
    }

    case users.SET_CURRENT_USER: {
      if (!action.payload.user) {
        break;
      }

      const schools = keyBy(
        action.payload.user.followed_schools
          .concat(action.payload.user.liked_schools)
          .map(s => cleanupSchoolObject(s)),
        'id'
      );
      state = state.merge(fromJS(schools));

      break;
    }
  }

  return state;
}
