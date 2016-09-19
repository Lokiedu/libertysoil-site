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

import { tools } from '../actions';


const initialState = i.fromJS({
  schools_river: [], // group things when the state gets clutered
  all_schools_loaded: false,
  schools_alphabet: [],
  user_posts_river: []
});

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case tools.TOOLS__ADD_SCHOOLS_TO_RIVER: {
      const ids = i.List(action.schools.map(school => school.id));
      state = state.update('schools_river', schools_river => schools_river.concat(ids));
      break;
    }

    case tools.TOOLS__SET_SCHOOLS_RIVER: {
      state = state.set('schools_river', i.List(action.schools.map(school => school.id)));
      break;
    }

    case tools.TOOLS__SET_ALL_SCHOOLS_LOADED: {
      state = state.set('all_schools_loaded', action.value);
      break;
    }

    case tools.TOOLS__SET_SCHOOLS_ALPHABET: {
      state = state.set('schools_alphabet', i.List(action.alphabet));
      break;
    }

    case tools.TOOLS__ADD_USER_POSTS_TO_RIVER: {
      const ids = i.List(action.posts.map(post => post.id));
      state = state.update('user_posts_river', user_posts_river => user_posts_river.concat(ids));
      break;
    }

    case tools.TOOLS__SET_USER_POSTS_RIVER: {
      state = state.set('user_posts_river', i.List(action.posts.map(posts => posts.id)));
      break;
    }
  }

  return state;
}
