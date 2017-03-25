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
import { Map, List, fromJS } from 'immutable';

import { search } from '../actions';

export const initialState = Map({
  results: Map({
    geotags: Map({
      items: List([]),
      count: 0
    }),
    hashtags: Map({
      items: List([]),
      count: 0
    }),
    posts: Map({
      items: List([]),
      count: 0
    }),
    schools: Map({
      items: List([]),
      count: 0
    })
  })
});

export function reducer(state = initialState, action) {
  switch (action.type) {
    case search.SET_SEARCH_RESULTS:
      state = state.set('results', fromJS(action.payload.results));
      break;

    case search.CLEAR_SEARCH_RESULTS:
      state = state.set('results', initialState.get('results'));
      break;
  }

  return state;
}
