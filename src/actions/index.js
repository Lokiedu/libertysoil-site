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
export const ui = require('./ui');
export const comments = require('./comments');
export const search = require('./search');
export const river = require('./river');
export const messages = require('./messages');

export const hashtags = require('./hashtags');
export const geotags = require('./geotags');

export const ADD_USER = 'ADD_USER';
export const ADD_SCHOOL = 'ADD_SCHOOL';

export const ADD_POST = 'ADD_POST';
export const SET_RELATED_POSTS = 'SET_RELATED_POSTS';
export const SET_USER_POSTS = 'SET_USER_POSTS';

export const SET_USER_TAGS = 'SET_USER_TAGS';

export const ADD_USER_FOLLOWED_SCHOOL = 'ADD_USER_FOLLOWED_SCHOOL';
export const REMOVE_USER_FOLLOWED_SCHOOL = 'REMOVE_USER_FOLLOWED_SCHOOL';
export const SET_SCHOOL_POSTS = 'SET_SCHOOL_POSTS';
export const SET_SCHOOLS = 'SET_SCHOOLS';
export const REMOVE_POST = 'REMOVE_POST';

export const SET_LIKES = 'SET_LIKES';
export const SET_FAVOURITES = 'SET_FAVOURITES';

export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const SET_CURRENT_USER = 'SET_CURRENT_USER';
export const SET_SUGGESTED_USERS = 'SET_SUGGESTED_USERS';
export const SET_PERSONALIZED_SUGGESTED_USERS = 'SET_PERSONALIZED_SUGGESTED_USERS';
export const ADD_LIKED_SCHOOL = 'ADD_LIKED_SCHOOL';
export const REMOVE_LIKED_SCHOOL = 'REMOVE_LIKED_SCHOOL';

export const SET_COUNTRIES = 'SET_COUNTRIES';
export const ADD_COUNTRY = 'ADD_COUNTRY';
export const ADD_CITY = 'ADD_CITY';
export const SET_COUNTRY_POSTS = 'SET_COUNTRY_POSTS';
export const SET_CITY_POSTS = 'SET_CITY_POSTS';
export const SUBMIT_RESET_PASSWORD = 'SUBMIT_RESET_PASSWORD';
export const SUBMIT_NEW_PASSWORD = 'SUBMIT_NEW_PASSWORD';
export const REGISTRATION_SUCCESS = 'REGISTRATION_SUCCESS';

export const SET_USER_RECENT_TAGS = 'SET_USER_RECENT_TAGS';
export const SET_SCHOOL_CLOUD = 'SET_SCHOOL_CLOUD';

export const SET_QUOTES = 'SET_QUOTES';

export const RESET_CREATE_POST_FORM = 'RESET_CREATE_POST_FORM';
export const UPDATE_CREATE_POST_FORM = 'UPDATE_CREATE_POST_FORM';
export const RESET_EDIT_POST_FORM = 'RESET_EDIT_POST_FORM';
export const UPDATE_EDIT_POST_FORM = 'UPDATE_EDIT_POST_FORM';

export function addUser(user) {
  return {
    type: ADD_USER,
    user
  };
}

export function addSchool(school) {
  return {
    type: ADD_SCHOOL,
    school
  };
}

export function addPost(post) {
  return {
    type: ADD_POST,
    post
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

export function setUserTags(tags) {
  return {
    type: SET_USER_TAGS,
    hashtags: tags.hashtags,
    schools: tags.schools,
    geotags: tags.geotags
  };
}

export function addUserFollowedSchool(school) {
  return {
    type: ADD_USER_FOLLOWED_SCHOOL,
    school
  };
}

export function removeUserFollowedSchool(school) {
  return {
    type: REMOVE_USER_FOLLOWED_SCHOOL,
    school
  };
}

export function setUserRecentTags(recent_tags) {
  return {
    type: SET_USER_RECENT_TAGS,
    recent_tags
  };
}

export function setSchoolPosts(school, posts) {
  return {
    type: SET_SCHOOL_POSTS,
    school,
    posts
  };
}

export function removePost(id) {
  return {
    type: REMOVE_POST,
    id
  };
}

export function setLikes(user_id, likes, post_id, likers) {
  return {
    type: SET_LIKES,
    user_id,
    likes,
    post_id,
    likers
  };
}

export function setFavourites(user_id, favourites, post_id, favourers) {
  return {
    type: SET_FAVOURITES,
    user_id,
    favourites,
    post_id,
    favourers
  };
}

export function setSchools(schools) {
  return {
    type: SET_SCHOOLS,
    schools
  };
}

export function loginSuccess() {
  return {
    type: LOGIN_SUCCESS
  };
}

export function setCurrentUser(user) {
  return {
    type: SET_CURRENT_USER,
    user
  };
}

export function setSuggestedUsers(suggested_users) {
  return {
    type: SET_SUGGESTED_USERS,
    suggested_users
  };
}

export function setPersonalizedSuggestedUsers(suggested_users) {
  return {
    type: SET_PERSONALIZED_SUGGESTED_USERS,
    suggested_users
  };
}

export function setCountries(countries) {
  return {
    type: SET_COUNTRIES,
    countries
  };
}

export function addCountry(country) {
  return {
    type: ADD_COUNTRY,
    country
  };
}

export function addCity(city) {
  return {
    type: ADD_CITY,
    city
  };
}

export function setCountryPosts(countryCode, posts) {
  return {
    type: SET_COUNTRY_POSTS,
    countryCode,
    posts
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

export function setCityPosts(cityId, posts) {
  return {
    type: SET_CITY_POSTS,
    cityId,
    posts
  };
}

export function setSchoolCloud(schools) {
  return {
    type: SET_SCHOOL_CLOUD,
    schools
  };
}

export function registrationSuccess() {
  return {
    type: REGISTRATION_SUCCESS
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

export function addLikedSchool(school) {
  return {
    type: ADD_LIKED_SCHOOL,
    school
  };
}

export function removeLikedSchool(school) {
  return {
    type: REMOVE_LIKED_SCHOOL,
    school
  };
}

export function setQuotes(quotes) {
  return {
    type: SET_QUOTES,
    quotes
  };
}
