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
import {
  getStore,
  addError, addMessage, removeAllMessages,
  addUser, addPost, addPostToRiver, setCurrentUser,
  setLikes, setFavourites
} from '../store';

const client = new ApiClient(API_HOST);

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

export async function favPost(current_user_id, post_id) {
  try {
    let responseBody = await client.fav(post_id);

    if (responseBody.success) {
      getStore().dispatch(setFavourites(current_user_id, responseBody.favourites));
    } else {
      getStore().dispatch(addError('internal server error. please try later'));
    }
  } catch (e) {
    getStore().dispatch(addError(e.message));
  }
}

export async function unfavPost(current_user_id, post_id) {
  try {
    let responseBody = await client.unfav(post_id);

    if (responseBody.success) {
      getStore().dispatch(setFavourites(current_user_id, responseBody.favourites));
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

export async function login(username, password) {
  getStore().dispatch(removeAllMessages());

  let user;

  try {
    let result = await client.login({username, password});

    if (result.success) {
      user = result.user;
      getStore().dispatch(setLikes(user.id, user.likes.map(like => like.post_id)));
      getStore().dispatch(setFavourites(user.id, user.favourites.map(fav => fav.post_id)));
    } else {
      getStore().dispatch(addError('Invalid username or password'));
    }
  } catch (e) {
    getStore().dispatch(addError('Invalid username or password'));
  }

  getStore().dispatch(setCurrentUser(user));
}

export async function registerUser(username, password, email, firstName, lastName) {
  getStore().dispatch(removeAllMessages());

  // FIXME: disable form
  try {
    let result = await client.registerUser({username, password, email, firstName, lastName});

    if ('error' in result) {
      // FIXME: enable form again
      getStore().dispatch(addError(result.error));
      return;
    }
  } catch (e) {
    // FIXME: enable form again

    if (e.response && ('error' in e.response.body)) {
      // FIXME: enable form again
      getStore().dispatch(addError(e.response.body.error));
      return;
    } else {
      console.log(e)
      console.log(e.stack)
      getStore().dispatch(addError('Server seems to have problems. Retry later, please'));
      return;
    }
  }

  getStore().dispatch(addMessage('User is registered successfully'));
}

export async function deletePost(post_uuid) {
  await client.deletePost(post_uuid);
  getStore().dispatch(removePost(post_uuid));
}

export async function updatePost(post_uuid, post_fields) {
  try {
    let result = await client.updatePost(post_uuid, post_fields);
    getStore().dispatch(addPost(result));

    return result;
  } catch (e) {
    getStore().dispatch(addError(e.message));
  }
}
