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
export const CLEAR_RIVER = 'CLEAR_RIVER';

export const SET_POSTS_TO_RIVER = 'SET_POSTS_TO_RIVER';
export const SET_POSTS_TO_LIKES_RIVER = 'SET_POSTS_TO_LIKES_RIVER';
export const SET_POSTS_TO_FAVOURITES_RIVER = 'SET_POSTS_TO_FAVOURITES_RIVER';

export const LOAD_HASHTAG_SUBSCRIPTONS_RIVER = 'LOAD_HASHTAG_SUBSCRIPTONS_RIVER';
export const LOAD_SCHOOL_SUBSCRIPTONS_RIVER = 'LOAD_SCHOOL_SUBSCRIPTONS_RIVER';
export const LOAD_GEOTAG_SUBSCRIPTONS_RIVER = 'LOAD_GEOTAG_SUBSCRIPTONS_RIVER';

export const LOAD_GROUPED_TAG_RIVER = 'SET_GROUPED_TAG_RIVER';
export const LOAD_FLAT_TAG_RIVER = 'LOAD_FLAT_TAG_RIVER';

export function clearRiver() {
  return {
    type: CLEAR_RIVER
  };
}

export function setPostsToRiver(posts) {
  return {
    type: SET_POSTS_TO_RIVER,
    payload: {
      posts
    }
  };
}

export function setPostsToLikesRiver(user_id, posts) {
  return {
    type: SET_POSTS_TO_LIKES_RIVER,
    payload: {
      user_id,
      posts
    }
  };
}

export function setPostsToFavouritesRiver(user_id, posts) {
  return {
    type: SET_POSTS_TO_FAVOURITES_RIVER,
    payload: {
      user_id,
      posts
    }
  };
}

export function loadHashtagSubscriptionsRiver(posts, meta = { offset: 0 }) {
  return {
    type: LOAD_HASHTAG_SUBSCRIPTONS_RIVER,
    payload: {
      posts
    },
    meta
  };
}

export function loadSchoolSubscriptionsRiver(posts, meta = { offset: 0 }) {
  return {
    type: LOAD_SCHOOL_SUBSCRIPTONS_RIVER,
    payload: {
      posts
    },
    meta
  };
}

export function loadGeotagSubscriptionsRiver(posts, meta = { offset: 0 }) {
  return {
    type: LOAD_GEOTAG_SUBSCRIPTONS_RIVER,
    payload: {
      posts
    },
    meta
  };
}

export function loadGroupedTagRiver(groups, query) {
  return {
    type: LOAD_GROUPED_TAG_RIVER,
    payload: {
      groups
    },
    meta: query
  };
}

export function loadFlatTagRiver(tags, query) {
  return {
    type: LOAD_GROUPED_TAG_RIVER,
    payload: {
      tags
    },
    meta: query
  };
}
