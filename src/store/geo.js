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
  cities: i.Map({}),    // index by numeric id
  cityPosts: i.Map({}),
  countries: i.Map({}),  // index by ISO-code
  countryPosts: i.Map({})
});

export default function reducer(state=initialState, action) {
  switch (action.type) {
    case a.SET_COUNTRIES: {
      state = state.set('countries', i.fromJS(_.keyBy(action.countries, 'iso_alpha2')));
      break;
    }

    case a.ADD_COUNTRY: {
      state = state.setIn(['countries', action.country.iso_alpha2], i.fromJS(action.country));
      break;
    }

    case a.ADD_CITY: {
      state = state.setIn(['cities', action.city.id.toString()], i.fromJS(action.city));
      break;
    }

    case a.SET_COUNTRY_POSTS: {
      state = state.setIn(['countryPosts', action.countryCode], i.List(action.posts.map(post => post.id)));
      break;
    }

    case a.SET_CITY_POSTS: {
      state = state.setIn(['cityPosts', action.cityId.toString()], i.List(action.posts.map(post => post.id)));
      break;
    }
  }

  return state;
}
