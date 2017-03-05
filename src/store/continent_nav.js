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
import { sortBy } from 'lodash';

import { geotags } from '../actions';

export const initialState = i.fromJS({
  continents: [],
  countries: []
});

export function reducer(state = initialState, action) {
  switch (action.type) {
    case geotags.CONTINENT_NAV__SET: {
      const sortedCountries = sortBy(action.payload.countries, 'name');

      state = i.fromJS({
        continents: action.payload.continents.map(continent => continent.url_name),
        countries: sortedCountries.sort().map(country => country.url_name)
      });

      break;
    }
  }

  return state;
}
