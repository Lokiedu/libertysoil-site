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
export const ADD_USER = 'ADD_USER';
export const ADD_USERS = 'ADD_USERS';
export const SET_CURRENT_USER = 'SET_CURRENT_USER';

export const SET_LIKES = 'SET_LIKES';
export const SET_FAVOURITES = 'SET_FAVOURITES';

export const SET_SUGGESTED_USERS = 'SET_SUGGESTED_USERS';
export const SET_PERSONALIZED_SUGGESTED_USERS = 'SET_PERSONALIZED_SUGGESTED_USERS';

export const REGISTRATION_SUCCESS = 'REGISTRATION_SUCCESS';
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';

export const SUBMIT_RESET_PASSWORD = 'SUBMIT_RESET_PASSWORD';
export const SUBMIT_NEW_PASSWORD = 'SUBMIT_NEW_PASSWORD';

export const SUBSCRIBE_TO_POST = 'SUBSCRIBE_TO_POST';
export const UNSUBSCRIBE_FROM_POST = 'UNSUBSCRIBE_FROM_POST';

export function addUser(user) {
  return {
    type: ADD_USER,
    payload: {
      user
    }
  };
}

export function addUsers(users) {
  return {
    type: ADD_USERS,
    payload: {
      users
    }
  };
}

export function setCurrentUser(user) {
  return {
    type: SET_CURRENT_USER,
    payload: {
      user
    }
  };
}

export function setLikes(user_id, likes, post_id, likers) {
  return {
    type: SET_LIKES,
    payload: {
      user_id,
      likes,
      post_id,
      likers
    }
  };
}

export function setFavourites(user_id, favourites, post_id, favourers) {
  return {
    type: SET_FAVOURITES,
    payload: {
      user_id,
      favourites,
      post_id,
      favourers
    }
  };
}

export function setSuggestedUsers(suggested_users) {
  return {
    type: SET_SUGGESTED_USERS,
    payload: {
      suggested_users
    }
  };
}

export function setPersonalizedSuggestedUsers(suggested_users) {
  return {
    type: SET_PERSONALIZED_SUGGESTED_USERS,
    payload: {
      suggested_users
    }
  };
}

export function registrationSuccess() {
  return {
    type: REGISTRATION_SUCCESS
  };
}

export function loginSuccess() {
  return {
    type: LOGIN_SUCCESS
  };
}

export function submitResetPassword() {
  return {
    type: SUBMIT_RESET_PASSWORD
  };
}

export function submitNewPassword() {
  return {
    type: SUBMIT_NEW_PASSWORD
  };
}

export function subscribeToPost(post_id) {
  return {
    type: SUBSCRIBE_TO_POST,
    payload: {
      post_id
    }
  };
}

export function unsubscribeFromPost(post_id) {
  return {
    type: UNSUBSCRIBE_FROM_POST,
    payload: {
      post_id
    }
  };
}
