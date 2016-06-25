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
export const ADD_POST_TO_RIVER = 'ADD_POST_TO_RIVER';

export const CLEAR_RIVER = 'CLEAR_RIVER';

export const SET_POSTS_TO_RIVER = 'SET_POSTS_TO_RIVER';
export const SET_POSTS_TO_LIKES_RIVER = 'SET_POSTS_TO_LIKES_RIVER';
export const SET_POSTS_TO_FAVOURITES_RIVER = 'SET_POSTS_TO_FAVOURITES_RIVER';

export function addPostToRiver(post) {
  return {
    type: ADD_POST_TO_RIVER,
    post
  };
}

export function clearRiver() {
  return {
    type: CLEAR_RIVER
  };
}

export function setPostsToRiver(posts) {
  return {
    type: SET_POSTS_TO_RIVER,
    posts
  };
}

export function setPostsToLikesRiver(user_id, posts) {
  return {
    type: SET_POSTS_TO_LIKES_RIVER,
    user_id,
    posts
  };
}

export function setPostsToFavouritesRiver(user_id, posts) {
  return {
    type: SET_POSTS_TO_FAVOURITES_RIVER,
    user_id,
    posts
  };
}
