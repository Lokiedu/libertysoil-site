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

import { users } from '../actions';

const initialState = i.Map({});

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case users.ADD_USER:
    case users.SET_CURRENT_USER: {
      if (action.payload.user && action.payload.user.following) {
        state = state.set(action.payload.user.id, i.List(action.payload.user.following.map(user => user.id)));
      }

      break;
    }

    case users.ADD_USERS: {
      const ids = action.payload.users.reduce((acc, user) => {
        if (Array.isArray(user.following)) {
          acc[user.id] = user.following.map(user => user.id);
        }
        return acc;
      }, {});

      state = state.mergeDeep(i.fromJS(ids));

      break;
    }
  }

  return state;
}
