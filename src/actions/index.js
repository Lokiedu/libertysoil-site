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
export const ADD_USER = 'ADD_USER';
export const ADD_SCHOOL = 'ADD_SCHOOL';

export const ADD_POST = 'ADD_POST';
export const ADD_POST_TO_RIVER = 'ADD_POST_TO_RIVER';
export const SET_POSTS_TO_RIVER = 'SET_POSTS_TO_RIVER';
export const SET_POSTS_TO_LIKES_RIVER = 'SET_POSTS_TO_LIKES_RIVER';
export const SET_POSTS_TO_FAVOURITES_RIVER = 'SET_POSTS_TO_FAVOURITES_RIVER';
export const SET_USER_POSTS = 'SET_USER_POSTS';
export const SET_USER_TAGS = 'SET_USER_TAGS';
export const SET_TAG_POSTS = 'SET_TAG_POSTS';
export const SET_SCHOOLS = 'SET_SCHOOLS';
export const REMOVE_POST = 'REMOVE_POST';

export const SET_LIKES = 'SET_LIKES';
export const SET_FAVOURITES = 'SET_FAVOURITES';

export const ADD_ERROR = 'ADD_ERROR';
export const ADD_MESSAGE = 'ADD_MESSAGE';
export const REMOVE_MESSAGE = 'REMOVE_MESSAGE';
export const REMOVE_ALL_MESSAGES = 'REMOVE_ALL_MESSAGES';

export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const SET_CURRENT_USER = 'SET_CURRENT_USER';

export const SET_COUNTRIES = 'SET_COUNTRIES';
export const ADD_COUNTRY = 'ADD_COUNTRY';
export const ADD_CITY = 'ADD_CITY';
export const SET_COUNTRY_POSTS = 'SET_COUNTRY_POSTS';
export const SET_CITY_POSTS = 'SET_CITY_POSTS';

export function addUser(user) {
  return {
    type: ADD_USER,
    user
  }
}

export function addSchool(school) {
  return {
    type: ADD_SCHOOL,
    school
  }
}

export function addPost(post) {
  return {
    type: ADD_POST,
    post
  }
}

export function addPostToRiver(post) {
  return {
    type: ADD_POST_TO_RIVER,
    post
  }
}

export function setPostsToRiver(posts) {
  return {
    type: SET_POSTS_TO_RIVER,
    posts
  }
}

export function setPostsToLikesRiver(user_id, posts) {
  return {
    type: SET_POSTS_TO_LIKES_RIVER,
    user_id,
    posts
  }
}

export function setPostsToFavouritesRiver(user_id, posts) {
  return {
    type: SET_POSTS_TO_FAVOURITES_RIVER,
    user_id,
    posts
  }
}

export function setUserPosts(user_id, posts) {
  return {
    type: SET_USER_POSTS,
    user_id,
    posts
  }
}

export function setUserTags(tags) {
  return {
    type: SET_USER_TAGS,
    tags
  }
}

export function setTagPosts(tag, posts) {
  return {
    type: SET_TAG_POSTS,
    tag,
    posts
  }
}

export function removePost(id) {
  return {
    type: REMOVE_POST,
    id
  }
}

export function setLikes(user_id, likes, post_id, likers) {
  return {
    type: SET_LIKES,
    user_id,
    likes,
    post_id,
    likers
  }
}

export function setFavourites(user_id, favourites, post_id, favourers) {
  return {
    type: SET_FAVOURITES,
    user_id,
    favourites,
    post_id,
    favourers
  }
}

export function setSchools(schools) {
  return {
    type: SET_SCHOOLS,
    schools
  }
}

export function addError(message) {
  return {
    type: ADD_ERROR,
    message
  }
}

export function addMessage(message) {
  return {
    type: ADD_MESSAGE,
    message
  }
}

export function removeMessage(index) {
  return {
    type: REMOVE_MESSAGE,
    index
  }
}

export function removeAllMessages() {
  return {
    type: REMOVE_ALL_MESSAGES
  }
}

export function loginSuccess() {
  return {
    type: LOGIN_SUCCESS
  }
}

export function setCurrentUser(user) {
  return {
    type: SET_CURRENT_USER,
    user
  }
}

export function setCountries(countries) {
  return {
    type: SET_COUNTRIES,
    countries
  }
}

export function addCountry(country) {
  return {
    type: ADD_COUNTRY,
    country
  }
}

export function addCity(city) {
  return {
    type: ADD_CITY,
    city
  }
}

export function setCountryPosts(countryCode, posts)
{
  return {
    type: SET_COUNTRY_POSTS,
    countryCode,
    posts
  }
}

export function setCityPosts(cityId, posts)
{
  return {
    type: SET_CITY_POSTS,
    cityId,
    posts
  }
}
