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
import { concat, keyBy } from 'lodash';

import { geotags as g, recentTags, users } from '../actions';

const initialState = Map({});

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case g.ADD_GEOTAG:
    case g.ADD_LIKED_GEOTAG:
    case g.ADD_USER_FOLLOWED_GEOTAG: {
      const geotag = action.payload.geotag;
      state = state.set(geotag.url_name, fromJS(geotag));

      break;
    }

    case g.ADD_GEOTAGS: {
      const geotags = keyBy(action.payload.geotags, 'url_name');
      state = state.mergeDeep(fromJS(geotags));

      break;
    }

    case g.SET_GEOTAG_CLOUD: {
      const geotags = action.payload.continents.reduce((acc, next) => {
        return acc.concat(next.geotags);
      }, []);
      state = state.mergeDeep(fromJS(keyBy(geotags, 'url_name')));

      break;
    }

    case g.SET_GEOTAGS: {
      const geotags = keyBy(action.payload.geotags, 'url_name');
      state = fromJS(geotags);

      break;
    }

    case recentTags.SET_RECENT_TAGS: {
      const geotags = keyBy(action.payload.geotags.entries, 'url_name');
      state = state.merge(fromJS(geotags));

      break;
    }

    case g.CONTINENT_NAV__SET: {
      const geotags = keyBy(concat(action.payload.continents, action.payload.countries), 'url_name');
      state = state.merge(fromJS(geotags));

      break;
    }

    case users.SET_CURRENT_USER: {
      if (!action.payload.user) {
        break;
      }

      const geotags = keyBy(
        action.payload.user.followed_geotags
          .concat(action.payload.user.liked_geotags),
        'url_name'
      );
      state = state.merge(fromJS(geotags));

      break;
    }
  }

  return state;
}
