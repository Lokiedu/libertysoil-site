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
import { API_HOST } from '../config'
import ApiClient from '../api/client'
import { getStore, addError, addUser, addPostToRiver, setLikes } from '../store';

let client = new ApiClient(API_HOST);

export async function likePost(current_user_id, post_id) {
  try {
    let responseBody = await client.like(post_id);

    if (responseBody.success) {
      getStore().dispatch(setLikes(current_user_id, responseBody.likes));
    } else {
      getStore().dispatch(addError('internal server error. please try later'));
    }
  } catch (e) {
    getStore().dispatch(addError(e.message));
  }
}

export async function unlikePost(current_user_id, post_id) {
  try {
    let responseBody = await client.unlike(post_id);

    if (responseBody.success) {
      getStore().dispatch(setLikes(current_user_id, responseBody.likes));
    } else {
      getStore().dispatch(addError('internal server error. please try later'));
    }
  } catch (e) {
    getStore().dispatch(addError(e.message));
  }
}

export async function createPost(type, data) {
  try {
    let result = await client.createPost(type, data);

    getStore().dispatch(addPostToRiver(result));
  } catch (e) {
    getStore().dispatch(addError(e.message));
  }
}

export async function followUser(user) {
  try {
    let res = await client.follow(user.username);

    if ('user' in res) {
      getStore().dispatch(addUser(res.user));
    }
  } catch (e) {
    getStore().dispatch(addError(e.message));
  }
}

export async function unfollowUser(user) {
  try {
    let res = await client.unfollow(user.username);

    if ('user' in res) {
      getStore().dispatch(addUser(res.user));
    }
  } catch (e) {
    getStore().dispatch(addError(e.message));
  }
}
