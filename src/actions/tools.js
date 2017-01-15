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
export const TOOLS__ADD_SCHOOLS_TO_RIVER = 'TOOLS__ADD_SCHOOLS_TO_RIVER';
export const TOOLS__SET_SCHOOLS_RIVER = 'TOOLS__SET_SCHOOLS_RIVER';
export const TOOLS__SET_ALL_SCHOOLS_LOADED = 'TOOLS__SET_ALL_SCHOOLS_LOADED';
export const TOOLS__SET_SCHOOLS_ALPHABET = 'TOOLS__SET_SCHOOLS_ALPHABET';

export const TOOLS__ADD_USER_POSTS_TO_RIVER = 'TOOLS__ADD_USER_POSTS_TO_RIVER';
export const TOOLS__SET_USER_POSTS_RIVER = 'TOOLS__SET_USER_POSTS_RIVER';

export const TOOLS__SET_FOLLOWED_USERS = 'TOOLS__SET_FOLLOWED_USERS';
export const TOOLS__SET_CONVERSATIONS_RIVER = 'TOOLS__SET_CONVERSATIONS_RIVER';

export function addSchoolsToRiver(schools) {
  return {
    type: TOOLS__ADD_SCHOOLS_TO_RIVER,
    payload: {
      schools
    }
  };
}

export function setSchoolsRiver(schools) {
  return {
    type: TOOLS__SET_SCHOOLS_RIVER,
    payload: {
      schools
    }
  };
}

export function setAllSchoolsLoaded(value) {
  return {
    type: TOOLS__SET_ALL_SCHOOLS_LOADED,
    payload: {
      value
    }
  };
}

export function setSchoolsAlphabet(alphabet) {
  return {
    type: TOOLS__SET_SCHOOLS_ALPHABET,
    payload: {
      alphabet
    }
  };
}


export function addUserPostsToRiver(posts) {
  return {
    type: TOOLS__ADD_USER_POSTS_TO_RIVER,
    payload: {
      posts
    }
  };
}

export function setUserPostsRiver(posts) {
  return {
    type: TOOLS__SET_USER_POSTS_RIVER,
    payload: {
      posts
    }
  };
}

export function setFollowedUsers(users) {
  return {
    type: TOOLS__SET_FOLLOWED_USERS,
    payload: {
      users
    }
  };
}

export function setConversationsRiver(users) {
  return {
    type: TOOLS__SET_CONVERSATIONS_RIVER,
    payload: {
      users
    }
  };
}
