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
import omit from 'lodash/omit';

import { search } from '../actions';

export const searchObject = Map({
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
  }),
  query: Map({})
});

export const initialState = Map({
  header: searchObject,
  page: searchObject
});

export function reducer(state = initialState, action) {
  switch (action.type) {
    case search.SET_SEARCH_RESULTS: {
      const searchId = action.payload.more.searchId;
      state = state.update(searchId, searchObject, s =>
        s.merge(fromJS(omit(action.payload, ['more'])))
      );
      break;
    }
    case search.CLEAR_SEARCH_RESULTS: {
      const searchId = action.payload.searchId;
      state = state.set(searchId, searchObject);
      break;
    }
  }

  return state;
}
