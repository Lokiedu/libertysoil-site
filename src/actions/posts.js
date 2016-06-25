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
export const ADD_POST = 'ADD_POST';
export const REMOVE_POST = 'REMOVE_POST';

export const SET_RELATED_POSTS = 'SET_RELATED_POSTS';
export const SET_USER_POSTS = 'SET_USER_POSTS';

export const SET_COUNTRY_POSTS = 'SET_COUNTRY_POSTS';
export const SET_CITY_POSTS = 'SET_CITY_POSTS';

export const RESET_CREATE_POST_FORM = 'RESET_CREATE_POST_FORM';
export const UPDATE_CREATE_POST_FORM = 'UPDATE_CREATE_POST_FORM';

export const RESET_EDIT_POST_FORM = 'RESET_EDIT_POST_FORM';
export const UPDATE_EDIT_POST_FORM = 'UPDATE_EDIT_POST_FORM';

export function addPost(post) {
  return {
    type: ADD_POST,
    post
  };
}

export function removePost(id) {
  return {
    type: REMOVE_POST,
    id
  };
}

export function setRelatedPosts(post_id, posts) {
  return {
    type: SET_RELATED_POSTS,
    post_id,
    posts
  };
}

export function setUserPosts(user_id, posts) {
  return {
    type: SET_USER_POSTS,
    user_id,
    posts
  };
}

export function setCountryPosts(countryCode, posts) {
  return {
    type: SET_COUNTRY_POSTS,
    countryCode,
    posts
  };
}

export function setCityPosts(cityId, posts) {
  return {
    type: SET_CITY_POSTS,
    cityId,
    posts
  };
}

export function resetCreatePostForm() {
  return {
    type: RESET_CREATE_POST_FORM
  };
}

export function updateCreatePostForm(create_post_form) {
  return {
    type: UPDATE_CREATE_POST_FORM,
    create_post_form
  };
}

export function resetEditPostForm() {
  return {
    type: RESET_EDIT_POST_FORM
  };
}

export function updateEditPostForm(edit_post_form) {
  return {
    type: UPDATE_EDIT_POST_FORM,
    edit_post_form
  };
}
