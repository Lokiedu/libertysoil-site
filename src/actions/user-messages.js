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
// When updating the whole message chain.
export const SET_USER_MESSAGES = 'SET_USER_MESSAGES';
// When sending a new message.
export const ADD_USER_MESSAGE = 'ADD_USER_MESSAGE';

export function setUserMessages(userId, messages) {
  return {
    type: SET_USER_MESSAGES,
    messages,
    userId
  };
}

export function addUserMessage(userId, message) {
  return {
    type: ADD_USER_MESSAGE,
    message,
    userId
  };
}
