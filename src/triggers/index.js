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
import {
  addError, addMessage, removeAllMessages,
  addUser, addPost, addPostToRiver, setCurrentUser, removePost,
  setLikes, setFavourites, setPostsToLikesRiver,
  setUserTags, setSchools, addSchool, setSuggestedUsers, setPostsToRiver,
  submitResetPassword, submitNewPassword, setTagCloud, addUserFollowedTag,
  removeUserFollowedTag, addUserFollowedSchool, removeUserFollowedSchool,
  removeMessage
} from '../actions';


export class ActionsTrigger {
  client;
  dispatch;

  constructor(client, dispatch) {
    this.client = client;
    this.dispatch = dispatch;
  }

  likePost = async (current_user_id, post_id) => {
    try {
      let responseBody = await this.client.like(post_id);

      if (responseBody.success) {
        this.dispatch(setLikes(current_user_id, responseBody.likes, post_id, responseBody.likers));
        await this.syncLikedPosts(current_user_id);
      } else {
        this.dispatch(addError('internal server error. please try later'));
      }
    } catch (e) {
      this.dispatch(addError(e.message));
    }
  };

  unlikePost = async (current_user_id, post_id) => {
    try {
      let responseBody = await this.client.unlike(post_id);

      if (responseBody.success) {
        this.dispatch(setLikes(current_user_id, responseBody.likes, post_id, responseBody.likers));
        await this.syncLikedPosts(current_user_id);
      } else {
        this.dispatch(addError('internal server error. please try later'));
      }
    } catch (e) {
      this.dispatch(addError(e.message));
    }
  };

  syncLikedPosts = async (current_user_id) => {
    try {
      let likedPosts = await this.client.userLikedPosts();

      this.dispatch(setPostsToLikesRiver(current_user_id, likedPosts));
    } catch (e) {
      this.dispatch(addError(e.message));
    }
  };

  favPost = async (current_user_id, post_id) => {
    try {
      let responseBody = await this.client.fav(post_id);

      if (responseBody.success) {
        this.dispatch(setFavourites(current_user_id, responseBody.favourites, post_id, responseBody.favourers));
      } else {
        this.dispatch(addError('internal server error. please try later'));
      }
    } catch (e) {
      this.dispatch(addError(e.message));
    }
  };

  unfavPost = async (current_user_id, post_id) => {
    try {
      let responseBody = await this.client.unfav(post_id);

      if (responseBody.success) {
        this.dispatch(setFavourites(current_user_id, responseBody.favourites, post_id, responseBody.favourers));
      } else {
        this.dispatch(addError('internal server error. please try later'));
      }
    } catch (e) {
      this.dispatch(addError(e.message));
    }
  };

  createPost = async (type, data) => {
    try {
      let result = await this.client.createPost(type, data);
      this.dispatch(addPostToRiver(result));

      let userTags = this.client.userTags();
      this.dispatch(setUserTags(await userTags));
    } catch (e) {
      this.dispatch(addError(e.message));
    }
  };

  updateUserInfo = async (user) => {
    try {
      let res = await this.client.updateUser(user);

      if ('user' in res) {
        this.dispatch(addMessage('Saved successfully'));
        this.dispatch(addUser(res.user));
      }
    } catch (e) {
      this.dispatch(addError(e.message));
    }
  };

  changePassword = async (old_password, new_password1, new_password2) => {
    if (old_password.trim() == '' || new_password1.trim() == '' || new_password2.trim() == '') {
      this.dispatch(addError('some of the fields are empty'));
      return;
    }

    if (new_password1 !== new_password2) {
      this.dispatch(addError('passwords do not match'));
      return;
    }

    try {
      let res = await this.client.changePassword(old_password, new_password1);

      if ('success' in res && res.success === true) {
        this.dispatch(addMessage('Password is changed successfully'));
      }
    } catch (e) {
      if (('body' in e.response) && ('error' in e.response.body)) {
        this.dispatch(addError(e.response.body.error));
      } else {
        this.dispatch(addError(e.message));
      }
    }
  };


  followUser = async (user) => {
    try {
      let res = await this.client.follow(user.username);

      if ('user1' in res) {
        this.dispatch(addUser(res.user1));
        this.dispatch(addUser(res.user2));
      }
    } catch (e) {
      this.dispatch(addError(e.message));
    }
  };

  unfollowUser = async (user) => {
    try {
      let res = await this.client.unfollow(user.username);

      if ('user1' in res) {
        this.dispatch(addUser(res.user1));
        this.dispatch(addUser(res.user2));
      }
    } catch (e) {
      this.dispatch(addError(e.message));
    }
  };

  login = async (username, password) => {
    this.dispatch(removeAllMessages());

    try {
      let result = await this.client.login({username, password});

      if (result.success) {
        let user = result.user;
        this.dispatch(setCurrentUser(user));
        this.dispatch(setLikes(user.id, user.liked_posts.map(like => like.id)));
        this.dispatch(setFavourites(user.id, user.favourited_posts.map(fav => fav.id)));
      } else {
        this.dispatch(addError('Invalid username or password'));
        this.dispatch(setCurrentUser(null));
      }
    } catch (e) {
      this.dispatch(setCurrentUser(null));
      if (('body' in e.response) && ('error' in e.response.body)) {
        this.dispatch(addError(e.response.body.error));
      } else {
        this.dispatch(addError('Invalid username or password'));
      }
    }
  };

  resetPassword = async (email) => {
    try {
      await this.client.resetPassword(email);
      this.dispatch(submitResetPassword());
    } catch (e) {
      this.dispatch(addError('Invalid username or password'));
    }
  };

  newPassword = async (hash, password, password_repeat) => {
    try {
      await this.client.newPassword(hash, password, password_repeat);
      this.dispatch(submitNewPassword());
    } catch (e) {
      if (('body' in e.response) && ('error' in e.response.body)) {
        this.dispatch(addError(e.response.body.error));
      } else {
        this.dispatch(addError(e.message));
      }
    }
  };

  registerUser = async (username, password, email, firstName, lastName) => {
    this.dispatch(removeAllMessages());

    // FIXME: disable form
    try {
      let result = await this.client.registerUser({username, password, email, firstName, lastName});

      if (result.success) {
        let user = result.user;

        this.dispatch(setCurrentUser(user));

        return user;
      }

      // FIXME: enable form again
      this.dispatch(addError(result.error));
    } catch (e) {
      // FIXME: enable form again

      if (e.response && ('error' in e.response.body)) {
        // FIXME: enable form again
        this.dispatch(addError(e.response.body.error));
      } else {
        this.dispatch(addError('Server seems to have problems. Retry later, please'));
      }
    }
  };

  deletePost = async (post_uuid) => {
    await this.client.deletePost(post_uuid);
    this.dispatch(removePost(post_uuid));
  };

  updatePost = async (post_uuid, post_fields) => {
    try {
      let result = await this.client.updatePost(post_uuid, post_fields);
      this.dispatch(addPost(result));

      return result;
    } catch (e) {
      this.dispatch(addError(e.message));
    }
  };

  updateSchool = async (school_uuid, school_fields) => {
    try {
      let result = await this.client.updateSchool(school_uuid, school_fields);
      this.dispatch(addSchool(result));

      return result;
    } catch (e) {
      this.dispatch(addError(e.message));
    }
  };

  loadSchools = async () => {
    try {
      let result = await this.client.schools();
      this.dispatch(setSchools(result));

      return result;
    } catch (e) {
      this.dispatch(addError(e.message));
    }
  };

  loadInitialSuggestions = async () => {
    try {
      let result = await this.client.initialSuggestions();

      this.dispatch(setSuggestedUsers(result));

      return result;
    } catch (e) {
      this.dispatch(addError(e.message));
    }
  };

  loadPostRiver = async () => {
    try {
      let result = await this.client.subscriptions();
      this.dispatch(setPostsToRiver(result));

      return result;
    } catch (e) {
      this.dispatch(addError(e.message));
    }
  };

  loadTagCloud = async () => {
    try {
      let result = await this.client.tagCloud();
      this.dispatch(setTagCloud(result));

      return result;
    } catch (e) {
      this.dispatch(addError(e.message));
    }
  };

  followTag = async (name) => {
    try {
      let result = await this.client.followTag(name);
      this.dispatch(addUserFollowedTag(result.tag));

      return result;
    } catch (e) {
      this.dispatch(addError(e.message));
    }
  };

  unfollowTag = async (name) => {
    try {
      let result = await this.client.unfollowTag(name);
      this.dispatch(removeUserFollowedTag(result.tag));

      return result;
    } catch (e) {
      this.dispatch(addError(e.message));
    }
  };

  followSchool = async (name) => {
    try {
      let result = await this.client.followSchool(name);
      this.dispatch(addUserFollowedSchool(result.school));

      return result;
    } catch (e) {
      this.dispatch(addError(e.message));
    }
  };

  unfollowSchool = async (name) => {
    try {
      let result = await this.client.unfollowSchool(name);
      this.dispatch(removeUserFollowedSchool(result.school));

      return result;
    } catch (e) {
      this.dispatch(addError(e.message));
    }
  };

  removeMessage = (id) => {
    this.dispatch(removeMessage(id))
  }

  loadUserTags = async () => {
    const userTags = this.client.userTags();
    this.dispatch(setUserTags(await userTags));
  }
}

