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
import { sortBy } from 'lodash';

import { userMessages } from '../actions';


export const initialState = i.fromJS({
  numUnread: 0,
  byUser: {}, // userId => { numUnread: 0, messages: [] },
  messageableUserIds: [] // for optimization
});

export function reducer(state = initialState, action) {
  switch (action.type) {
    case userMessages.LOAD_USER_MESSAGES: {
      state = state.withMutations(state => {
        state.setIn(
          ['byUser', action.payload.userId, 'messages'],
          i.fromJS(action.payload.messages)
        );
      });

      break;
    }

    case userMessages.SEND_USER_MESSAGE: {
      state = state.updateIn(['byUser', action.payload.receiverId, 'messages'], messages => (
        (messages || i.List()).push(i.fromJS(action.payload.message))
      ));

      break;
    }

    case userMessages.UPDATE_USER_MESSAGE: {
      const index = state.getIn(['byUser', action.payload.receiverId, 'messages'])
        .findIndex(m => m.get('id') === action.payload.message.id);

      if (index > -1) {
        state = state.updateIn(
          ['byUser', action.payload.receiverId, 'messages', index],
          message => message.mergeDeep(action.payload.message)
        );
      }

      break;
    }

    case userMessages.REMOVE_USER_MESSAGE: {
      state = state.updateIn(['byUser', action.payload.receiverId, 'messages'], messages => (
        messages.filterNot(m => m.get('id') === action.payload.messageId)
      ));

      break;
    }

    case userMessages.UPDATE_USER_MESSAGES_STATUS: {
      state = state.mergeDeep(i.fromJS(action.payload));

      break;
    }

    case userMessages.LOAD_MESSAGEABLE_USERS: {
      const userIds = sortBy(action.payload.users, 'name').map(u => u.id);
      const usersById = userIds.reduce((acc, id) => {
        acc[id] = { messages: null };
        return acc;
      }, {});

      state = state.withMutations(state => {
        state.update('byUser', byUser => byUser.mergeDeep(i.fromJS(usersById)));
        state.set('messageableUserIds', i.List(userIds));
      });

      break;
    }
  }

  return state;
}
