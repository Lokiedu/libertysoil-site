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
export const ADD_GEOTAG = 'ADD_GEOTAG';
export const SET_GEOTAGS = 'SET_GEOTAGS';
export const SET_GEOTAG_POSTS = 'SET_GEOTAG_POSTS';
export const SET_GEOTAG_CLOUD = 'SET_GEOTAG_CLOUD';

export const ADD_LIKED_GEOTAG = 'ADD_LIKED_GEOTAG';
export const REMOVE_LIKED_GEOTAG = 'REMOVE_LIKED_GEOTAG';

export const ADD_USER_FOLLOWED_GEOTAG = 'ADD_USER_FOLLOWED_GEOTAG';
export const REMOVE_USER_FOLLOWED_GEOTAG = 'REMOVE_USER_FOLLOWED_GEOTAG';

export function addGeotag(geotag) {
  return {
    type: ADD_GEOTAG,
    payload: {
      geotag
    }
  };
}

export function setGeotags(geotags) {
  return {
    type: SET_GEOTAGS,
    payload: {
      geotags
    }
  };
}

export function setGeotagPosts(geotag, posts) {
  return {
    type: SET_GEOTAG_POSTS,
    payload: {
      geotag,
      posts
    }
  };
}

export function setGeotagCloud(continents) {
  return {
    type: SET_GEOTAG_CLOUD,
    payload: {
      continents
    }
  };
}

export function addLikedGeotag(geotag) {
  return {
    type: ADD_LIKED_GEOTAG,
    payload: {
      geotag
    }
  };
}

export function removeLikedGeotag(geotag) {
  return {
    type: REMOVE_LIKED_GEOTAG,
    payload: {
      geotag
    }
  };
}

export function addUserFollowedGeotag(geotag) {
  return {
    type: ADD_USER_FOLLOWED_GEOTAG,
    payload: {
      geotag
    }
  };
}

export function removeUserFollowedGeotag(geotag) {
  return {
    type: REMOVE_USER_FOLLOWED_GEOTAG,
    payload: {
      geotag
    }
  };
}
