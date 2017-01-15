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
import { find } from 'lodash';
import { LOCATION_CHANGE } from 'react-router-redux';

import { messages } from '../actions';
import messageType from '../consts/messageTypeConstants';

const initialState = i.List([]);

function removeDuplicate(state, action) {
  const index = state.findIndex(item => item.message === action.payload.message);

  if (index >= 0) {
    return state.delete(index);
  }
  return state;
}

export default function reducer(state = initialState, action) {
  if (find([messages.ADD_ERROR, messages.ADD_MESSAGE], a => a === action.type)) {
    const index = state.findIndex(item => item.get('message') === action.payload.message);
    if (index !== -1) {
      state = state.delete(index);
    }
  }

  switch (action.type) {
    case messages.ADD_ERROR: {
      state = removeDuplicate(state, action);

      state = state.push(i.fromJS({
        type: messageType.ERROR,
        message: action.payload.message
      }));
      break;
    }

    case messages.ADD_MESSAGE: {
      state = removeDuplicate(state, action);

      state = state.push(i.fromJS({
        type: messageType.MESSAGE,
        message: action.payload.message
      }));
      break;
    }

    case messages.REMOVE_MESSAGE: {
      state = state.remove(action.payload.index);
      break;
    }

    case LOCATION_CHANGE:
    case messages.REMOVE_ALL_MESSAGES: {
      state = state.clear();
      break;
    }
  }

  return state;
}
