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
import { Map as ImmutableMap } from 'immutable';

import * as a from '../actions/remote';

export const initialState = ImmutableMap({
  args: {},
  isVisible: false
});

function setIfHas(obj, fieldName, dest) {
  if (fieldName in obj) {
    dest.set(fieldName, obj[fieldName]);
  }
}

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case a.SET_REMOTE:
      {
        state = state.withMutations(s => {
          setIfHas(action.payload, 'args', s);
          setIfHas(action.payload, 'component', s);
          setIfHas(action.payload, 'isVisible', s);
        });
        break;
      }
    case a.RESET_REMOTE:
      {
        state = initialState;
        break;
      }
    case a.TOGGLE_REMOTE:
      {
        if (action.isVisible !== 'undefined') {
          state = state.set('isVisible', action.isVisible);
        } else {
          state = state.update('isVisible', is => !is);
        }
        break;
      }
  }

  return state;
}
