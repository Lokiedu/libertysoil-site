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
import { getStore } from '../store';
import {
  addError, addMessage, removeAllMessages,
  addUser, addPost, addPostToRiver, setCurrentUser, removePost,
  setLikes, setFavourites, setPostsToLikesRiver,
  setUserTags, setSchools, addSchool
} from '../actions';

const client = new ApiClient(API_HOST);

export async function likePost(current_user_id, post_id) {
  try {
    let responseBody = await client.like(post_id);

    if (responseBody.success) {
      getStore().dispatch(setLikes(current_user_id, responseBody.likes, post_id, responseBody.likers));
      syncLikedPosts(current_user_id);
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
      getStore().dispatch(setLikes(current_user_id, responseBody.likes, post_id, responseBody.likers));
      syncLikedPosts(current_user_id);
    } else {
      getStore().dispatch(addError('internal server error. please try later'));
    }
  } catch (e) {
    getStore().dispatch(addError(e.message));
  }
}

export async function syncLikedPosts() {
  try {
    let likedPosts = client.userLikedPosts();
    getStore().dispatch(setPostsToLikesRiver(await likedPosts));
  } catch (e) {
    getStore().dispatch(addError(e.message));
  }
}

export async function favPost(current_user_id, post_id) {
  try {
    let responseBody = await client.fav(post_id);

    if (responseBody.success) {
      getStore().dispatch(setFavourites(current_user_id, responseBody.favourites, post_id, responseBody.favourers));
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
      getStore().dispatch(setFavourites(current_user_id, responseBody.favourites, post_id, responseBody.favourers));
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

    let userTags = client.userTags();
    getStore().dispatch(setUserTags(await userTags));
  } catch (e) {
    console.log(e)
    console.log(e.stack)

    getStore().dispatch(addError(e.message));
  }
}

export async function updateUserInfo(user) {
  try {
    let res = await client.updateUser(user);

    if ('user' in res) {
      getStore().dispatch(addMessage('Saved successfully'));
      getStore().dispatch(addUser(res.user));
    }
  } catch (e) {
    getStore().dispatch(addError(e.message));
  }
}

export async function changePassword(old_password, new_password1, new_password2)
{
  if (old_password.trim() == '' || new_password1.trim() == '' || new_password2.trim() == '') {
    getStore().dispatch(addError('some of the fields are empty'));
    return;
  }

  if (new_password1 !== new_password2) {
    getStore().dispatch(addError('passwords do not match'));
    return;
  }

  try {
    let res = await client.changePassword(old_password, new_password1);

    if ('success' in res && res.success === true) {
      getStore().dispatch(addMessage('Password is changed successfully'));
    }
  } catch (e) {
    if (('body' in e.response) && ('error' in e.response.body)) {
      getStore().dispatch(addError(e.response.body.error));
    } else {
      getStore().dispatch(addError(e.message));
    }
  }
}


export async function followUser(user) {
  try {
    let res = await client.follow(user.username);

    if ('user1' in res) {
      getStore().dispatch(addUser(res.user1));
      getStore().dispatch(addUser(res.user2));
    }
  } catch (e) {
    getStore().dispatch(addError(e.message));
  }
}

export async function unfollowUser(user) {
  try {
    let res = await client.unfollow(user.username);

    if ('user1' in res) {
      getStore().dispatch(addUser(res.user1));
      getStore().dispatch(addUser(res.user2));
    }
  } catch (e) {
    getStore().dispatch(addError(e.message));
  }
}

export async function login(username, password) {
  getStore().dispatch(removeAllMessages());

  try {
    let result = await client.login({username, password});

    if (result.success) {
      let user = result.user;
      getStore().dispatch(setCurrentUser(user));
      getStore().dispatch(setLikes(user.id, user.liked_posts.map(like => like.id)));
      getStore().dispatch(setFavourites(user.id, user.favourited_posts.map(fav => fav.id)));
    } else {
      getStore().dispatch(setCurrentUser(null));
      getStore().dispatch(addError('Invalid username or password'));
    }
  } catch (e) {
    getStore().dispatch(setCurrentUser(null));
    getStore().dispatch(addError('Invalid username or password'));
  }
}

export async function resetPassword(email) {

  try {
    let result = await client.resetPassword(email);
  } catch (e) {
  }

}

export async function newPassword(hash, password, password_repeat) {

  try {
    let result = await client.newPassword(hash, password, password_repeat);
  } catch (e) {
  }

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

export async function updateSchool(school_uuid, school_fields) {
  try {
    let result = await client.updateSchool(school_uuid, school_fields);
    getStore().dispatch(addSchool(result));

    return result;
  } catch (e) {
    getStore().dispatch(addError(e.message));
  }
}

export async function loadSchools() {
  try {
    let result = await client.schools();
    getStore().dispatch(setSchools(result));

    return result;
  } catch (e) {
    getStore().dispatch(addError(e.message));
  }
}
