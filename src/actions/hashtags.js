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
export const ADD_HASHTAG = 'ADD_HASHTAG';
export const SET_HASHTAGS = 'SET_HASHTAGS';
export const SET_HASHTAG_POSTS = 'SET_HASHTAG_POSTS';
export const SET_HASHTAG_CLOUD = 'SET_HASHTAG_CLOUD';

export const ADD_LIKED_HASHTAG = 'ADD_LIKED_HASHTAG';
export const REMOVE_LIKED_HASHTAG = 'REMOVE_LIKED_HASHTAG';

export const ADD_USER_FOLLOWED_HASHTAG = 'ADD_USER_FOLLOWED_HASHTAG';
export const REMOVE_USER_FOLLOWED_HASHTAG = 'REMOVE_USER_FOLLOWED_HASHTAG';

export function addHashtag(hashtag) {
  return {
    type: ADD_HASHTAG,
    hashtag
  };
}

export function setHashtags(hashtags) {
  return {
    type: SET_HASHTAGS,
    hashtags
  };
}

export function setHashtagPosts(hashtag, posts) {
  return {
    type: SET_HASHTAG_POSTS,
    hashtag,
    posts
  };
}

export function setHashtagCloud(hashtags) {
  return {
    type: SET_HASHTAG_CLOUD,
    hashtags
  };
}

export function addLikedHashtag(hashtag) {
  return {
    type: ADD_LIKED_HASHTAG,
    hashtag
  };
}

export function removeLikedHashtag(hashtag) {
  return {
    type: REMOVE_LIKED_HASHTAG,
    hashtag
  };
}

export function addUserFollowedHashtag(hashtag) {
  return {
    type: ADD_USER_FOLLOWED_HASHTAG,
    hashtag
  };
}

export function removeUserFollowedHashtag(hashtag) {
  return {
    type: REMOVE_USER_FOLLOWED_HASHTAG,
    hashtag
  };
}
