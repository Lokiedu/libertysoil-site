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
export const ADD_SCHOOL = 'ADD_SCHOOL';
export const SET_SCHOOLS = 'SET_SCHOOLS';
export const SET_SCHOOL_POSTS = 'SET_SCHOOL_POSTS';
export const SET_SCHOOL_CLOUD = 'SET_SCHOOL_CLOUD';

export const ADD_LIKED_SCHOOL = 'ADD_LIKED_SCHOOL';
export const REMOVE_LIKED_SCHOOL = 'REMOVE_LIKED_SCHOOL';

export const ADD_USER_FOLLOWED_SCHOOL = 'ADD_USER_FOLLOWED_SCHOOL';
export const REMOVE_USER_FOLLOWED_SCHOOL = 'REMOVE_USER_FOLLOWED_SCHOOL';

export function addSchool(school) {
  return {
    type: ADD_SCHOOL,
    school
  };
}

export function setSchools(schools) {
  return {
    type: SET_SCHOOLS,
    schools
  };
}

export function setSchoolPosts(school, posts) {
  return {
    type: SET_SCHOOL_POSTS,
    school,
    posts
  };
}

export function setSchoolCloud(schools) {
  return {
    type: SET_SCHOOL_CLOUD,
    schools
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
