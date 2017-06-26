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
export const SEND_USER_MESSAGE = 'SEND_USER_MESSAGE';
export const LOAD_USER_MESSAGES = 'LOAD_USER_MESSAGES';
export const REMOVE_USER_MESSAGE = 'REMOVE_USER_MESSAGE';
export const UPDATE_USER_MESSAGE = 'UPDATE_USER_MESSAGE';
export const UPDATE_USER_MESSAGES_STATUS = 'UPDATE_USER_MESSAGES_STATUS'; // counters and visit dates
export const LOAD_MESSAGEABLE_USERS = 'LOAD_MESSAGEABLE_USERS';

export function loadUserMessages(userId, messages) {
  return {
    type: LOAD_USER_MESSAGES,
    payload: {
      userId,
      messages
    }
  };
}

export function sendUserMessage(receiverId, message) {
  return {
    type: SEND_USER_MESSAGE,
    payload: {
      receiverId,
      message
    }
  };
}

export function removeUserMessage(receiverId, messageId) {
  return {
    type: REMOVE_USER_MESSAGE,
    payload: {
      receiverId,
      messageId
    }
  };
}

export function updateUserMessage(receiverId, message) {
  return {
    type: UPDATE_USER_MESSAGE,
    payload: {
      receiverId,
      message
    }
  };
}

/**
 * @param {Object} status `{ numUnread: Number, byUser: { [userId]: { numUnread: Number, visitedAt: Date } } }`
 */
export function updateUserMessagesStatus(status) {
  return {
    type: UPDATE_USER_MESSAGES_STATUS,
    payload: {
      ...status
    }
  };
}

export function loadMessageableUsers(users, meta = { offset: 0 }) {
  return {
    type: LOAD_MESSAGEABLE_USERS,
    payload: {
      users
    },
    meta
  };
}
