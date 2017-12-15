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
import { concat, keyBy } from 'lodash';

import { geotags as g, recentTags } from '../actions';

const initialState = i.Map({});

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case g.ADD_GEOTAG: {
      const geotag = action.payload.geotag;
      state = state.set(geotag.url_name, i.fromJS(geotag));

      break;
    }

    case g.ADD_GEOTAGS: {
      const geotags = keyBy(action.payload.geotags, 'url_name');
      state = state.mergeDeep(i.fromJS(geotags));

      break;
    }

    case g.SET_GEOTAG_CLOUD: {
      const geotags = action.payload.continents.reduce((acc, next) => {
        return acc.concat(next.geotags);
      }, []);
      state = state.mergeDeep(i.fromJS(keyBy(geotags, 'url_name')));

      break;
    }

    case recentTags.SET_RECENT_TAGS:
    case g.SET_GEOTAGS: {
      const geotags = keyBy(action.payload.geotags, 'url_name');
      state = i.fromJS(geotags);

      break;
    }

    case g.CONTINENT_NAV__SET: {
      const geotags = keyBy(concat(action.payload.continents, action.payload.countries), 'url_name');
      state = state.merge(i.fromJS(geotags));

      break;
    }
  }

  return state;
}
