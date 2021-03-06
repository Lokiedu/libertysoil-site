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
import { isPlainObject, isError, uniqueId } from 'lodash';
import { LOCATION_CHANGE } from 'react-router-redux';

import { messages } from '../actions';
import messageType from '../consts/messageTypeConstants';

export const initialState = i.OrderedMap();

export function reducer(state = initialState, action) {
  switch (action.type) {
    case messages.ADD_ERROR: {
      const id = uniqueId();
      const message = action.payload;

      state = state.set(
        id,
        i.fromJS({
          id,
          type: messageType.ERROR,
          message: message.message,
          payload: message.payload
        })
      );
      break;
    }

    case messages.ADD_MESSAGE: {
      const id = uniqueId();
      const message = action.payload;

      state = state.set(
        id,
        i.fromJS({
          id,
          type: messageType.MESSAGE,
          message: message.message,
          payload: message.payload
        })
      );
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

    // Process FSA error objects
    default: {
      if (action.error) {
        const id = uniqueId();

        if (action.meta && action.meta.display) {
          let message = action.payload, payload;
          if (isError(message) || isPlainObject(message)) {
            payload = message.payload;
            message = message.message;
          }

          state = state.set(
            id,
            i.fromJS({
              id,
              type: messageType.ERROR,
              message,
              payload
            })
          );
        } else {
          state = state.set(
            id,
            i.fromJS({
              id,
              type: messageType.ERROR,
              message: 'Something went wrong'
            })
          );
        }

        if (isPlainObject(action.payload)) {
          console.error(action.payload.message); // eslint-disable-line no-console
        } else {
          console.error(action.payload);// eslint-disable-line no-console
        }
      }
    }
  }

  return state;
}
