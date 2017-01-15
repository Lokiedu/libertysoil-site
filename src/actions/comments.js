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
export const SAVE_COMMENT__START = 'SAVE_COMMENT__START';
export const SAVE_COMMENT__FAILURE = 'SAVE_COMMENT__FAILURE';
export const SAVE_COMMENT__SUCCESS = 'SAVE_COMMENT__SUCCESS';

export const DELETE_COMMENT__START = 'DELETE_COMMENT__START';
export const DELETE_COMMENT__FAILURE = 'DELETE_COMMENT__FAILURE';
export const DELETE_COMMENT__SUCCESS = 'DELETE_COMMENT__SUCCESS';

export const CREATE_COMMENT__START = 'CREATE_COMMENT__START';
export const CREATE_COMMENT__FAILURE = 'CREATE_COMMENT__FAILURE';
export const CREATE_COMMENT__SUCCESS = 'CREATE_COMMENT__SUCCESS';

export const SET_POST_COMMENTS = 'SET_POST_COMMENTS';

export function saveCommentStart(postId, commentId) {
  return {
    type: SAVE_COMMENT__START,
    payload: {
      postId,
      commentId
    }
  };
}

export function saveCommentSuccess(postId, commentId) {
  return {
    type: SAVE_COMMENT__SUCCESS,
    payload: {
      postId,
      commentId
    }
  };
}

export function saveCommentFailure(postId, commentId, message) {
  return {
    type: SAVE_COMMENT__FAILURE,
    payload: {
      postId,
      commentId,
      message
    }
  };
}

export function deleteCommentStart(postId, commentId) {
  return {
    type: DELETE_COMMENT__START,
    payload: {
      postId,
      commentId
    }
  };
}

export function deleteCommentSuccess(postId, commentId) {
  return {
    type: DELETE_COMMENT__SUCCESS,
    payload: {
      postId,
      commentId
    }
  };
}

export function deleteCommentFailure(postId, commentId, message) {
  return {
    type: DELETE_COMMENT__FAILURE,
    payload: {
      postId,
      commentId,
      message
    }
  };
}

export function createCommentStart(postId, text) {
  return {
    type: CREATE_COMMENT__START,
    payload: {
      postId,
      text
    }
  };
}

export function createCommentSuccess(postId) {
  return {
    type: CREATE_COMMENT__SUCCESS,
    payload: {
      postId
    }
  };
}

export function createCommentFailure(postId, message) {
  return {
    type: CREATE_COMMENT__FAILURE,
    payload: {
      postId,
      message
    }
  };
}

export function setPostComments(postId, comments) {
  return {
    type: SET_POST_COMMENTS,
    payload: {
      postId,
      comments
    }
  };
}
