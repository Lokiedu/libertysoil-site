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
import { browserHistory } from 'react-router';
import { toSpreadArray } from '../utils/lang';

import {
  addError, addMessage, removeAllMessages,
  addUser, addPost, addPostToRiver, setCurrentUser, removePost, clearRiver,
  setPostComments,
  saveCommentStart, saveCommentSuccess, saveCommentFailure,
  deleteCommentStart, deleteCommentSuccess, deleteCommentFailure,
  createCommentStart, createCommentSuccess, createCommentFailure,
  setLikes, setFavourites, setPostsToLikesRiver,
  setUserTags, setSchools, addHashtag, addGeotag, addSchool, setSuggestedUsers, setPersonalizedSuggestedUsers, setPostsToRiver,
  submitResetPassword, submitNewPassword, setTagCloud, setSchoolCloud, setGeotagCloud, addUserFollowedTag,
  removeUserFollowedTag, addUserFollowedSchool, removeUserFollowedSchool,
  removeMessage, registrationSuccess, showRegisterForm,
  addUserFollowedGeotag, removeUserFollowedGeotag,
  addLikedHashtag, addLikedSchool, addLikedGeotag,
  removeLikedHashtag, removeLikedSchool, removeLikedGeotag,
  setUIProgress, setUserRecentTags, setQuotes,
  setCountries
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

  likeHashtag = async (name) => {
    try {
      let response = await this.client.likeHashtag(name);

      if (response.success) {
        this.dispatch(addLikedHashtag(response.hashtag));
      } else {
        this.dispatch(addError('internal server error. please try later'));
      }
    } catch (e) {
      this.dispatch(addError(e.message));
    }
  };

  unlikeHashtag = async (name) => {
    try {
      let response = await this.client.unlikeHashtag(name);

      if (response.success) {
        this.dispatch(removeLikedHashtag(response.hashtag));
      } else {
        this.dispatch(addError('internal server error. please try later'));
      }
    } catch (e) {
      this.dispatch(addError(e.message));
    }
  };

  likeSchool = async (url_name) => {
    try {
      let response = await this.client.likeSchool(url_name);

      if (response.success) {
        this.dispatch(addLikedSchool(response.school));
      } else {
        this.dispatch(addError('internal server error. please try later'));
      }
    } catch (e) {
      this.dispatch(addError(e.message));
    }
  };

  unlikeSchool = async (url_name) => {
    try {
      let response = await this.client.unlikeSchool(url_name);

      if (response.success) {
        this.dispatch(removeLikedSchool(response.school));
      } else {
        this.dispatch(addError('internal server error. please try later'));
      }
    } catch (e) {
      this.dispatch(addError(e.message));
    }
  };

  likeGeotag = async (url_name) => {
    try {
      let response = await this.client.likeGeotag(url_name);

      if (response.success) {
        this.dispatch(addLikedGeotag(response.geotag));
      } else {
        this.dispatch(addError('internal server error. please try later'));
      }
    } catch (e) {
      this.dispatch(addError(e.message));
    }
  };

  unlikeGeotag = async (url_name) => {
    try {
      let response = await this.client.unlikeGeotag(url_name);

      if (response.success) {
        this.dispatch(removeLikedGeotag(response.geotag));
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

      let userTags = await this.client.userTags();
      this.dispatch(setUserTags(userTags));
    } catch (e) {
      this.dispatch(addError(e.message));
    }
  };

  updateUserInfo = async (user) => {
    let status = false;
    try {
      let res = await this.client.updateUser(user);

      if ('user' in res) {
        this.dispatch(addMessage('Saved successfully'));
        this.dispatch(addUser(res.user));
        status = true;
      }
    } catch (e) {
      if (('body' in e.response) && ('error' in e.response.body)) {
        this.dispatch(addError(e.response.body.error));
      } else {
        this.dispatch(addError(e.message));
      }
    }
    return status;
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

      this.dispatch(clearRiver());
      this.loadPostRiver();

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

      this.dispatch(clearRiver());
      this.loadPostRiver();

    } catch (e) {
      this.dispatch(addError(e.message));
    }
  };

  ignoreUser = async (user) => {
    try {
      await this.client.ignoreUser(user.username);
      let result = await this.client.userSuggestions();

      this.dispatch(setPersonalizedSuggestedUsers(result));
    } catch (e) {
      this.dispatch(addError(e.message));
    }
  };

  login = async (username, password) => {
    this.dispatch(removeAllMessages());

    let user = null;

    try {
      const result = await this.client.login({ username, password });

      if (!result.success) {
        this.dispatch(setCurrentUser(null));
        this.dispatch(addError('Invalid username or password'));
        return;
      }

      user = result.user;
    } catch (e) {
      this.dispatch(setCurrentUser(null));

      if (e.response && ('body' in e.response) && ('error' in e.response.body)) {
        this.dispatch(addError(e.response.body.error));
      } else if (e.status === 401) {
        this.dispatch(addError('Invalid username or password'));
      } else {
        // FIXME: this should be reported to developers instead (use Sentry?)
        console.warn(e);  // eslint-disable-line no-console
        this.dispatch(addError('Server error: please retry later'));
      }

      return;
    }

    try {
      this.dispatch(setCurrentUser(user));
      this.dispatch(setLikes(user.id, user.liked_posts.map(like => like.id)));
      this.dispatch(setFavourites(user.id, user.favourited_posts.map(fav => fav.id)));

      if (!user.more || user.more.first_login) {
        browserHistory.push('/induction');
      } else {
        browserHistory.push('/suggestions');
      }
    } catch (e) {
      this.dispatch(addError(e.message));
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
      let result = await this.client.registerUser({ username, password, email, firstName, lastName });

      if (result.success) {
        this.dispatch(registrationSuccess());
      }

    } catch (e) {
      // FIXME: enable form again

      if (e.response && ('error' in e.response.body)) {
        // FIXME: enable form again
        let errors = e.response.body.error;
        let message = '';
        for (let i in errors) {
          errors[i].map((el) => {
            message += `${el}\n`;
          });
        }

        this.dispatch(addError(message));
      } else {
        this.dispatch(addError('Server seems to have problems. Retry later, please'));
      }
    }
  };

  setQuotes = async () => {
    try {
      let result = await this.client.getQuotes();

      this.dispatch(setQuotes(result));
    } catch (e) {
      this.dispatch(addError(e.message));
    }
  }

  deletePost = async (post_uuid) => {
    try {
      let result = await this.client.deletePost(post_uuid);

      if (result.error) {
        throw new Error(result.error);
      }

      this.dispatch(removePost(post_uuid));
    } catch (e) {
      this.dispatch(addError(e.message));
      throw e;
    }
  };

  loadUserRecentTags = async () => {
    try {
      let geotags = await this.client.userRecentGeotags();
      let schools = await this.client.userRecentSchools();
      let hashtags = await this.client.userRecentHashtags();

      this.dispatch(setUserRecentTags({ geotags, schools, hashtags }));
    } catch (e) {
      this.dispatch(addError(e.message));
    }
  };

  updatePost = async (post_uuid, post_fields) => {
    try {
      let result = await this.client.updatePost(post_uuid, post_fields);
      this.dispatch(addPost(result));
    } catch (e) {
      this.dispatch(addError(e.message));
    }
  };

  updateGeotag = async (geotag_uuid, geotag_fields) => {
    try {
      let result = await this.client.updateGeotag(geotag_uuid, geotag_fields);
      this.dispatch(addGeotag(result));

      return result;
    } catch (e) {
      this.dispatch(addError(e.message));
      throw e;
    }
  };

  updateHashtag = async (hashtag_uuid, hashtag_fields) => {
    try {
      let result = await this.client.updateHashtag(hashtag_uuid, hashtag_fields);
      this.dispatch(addHashtag(result));

      return result;
    } catch (e) {
      this.dispatch(addError(e.message));
      throw e;
    }
  };

  updateSchool = async (school_uuid, school_fields) => {
    try {
      let result = await this.client.updateSchool(school_uuid, school_fields);
      this.dispatch(addSchool(result));

      return result;
    } catch (e) {
      this.dispatch(addError(e.message));
      throw e;
    }
  };

  loadSchools = async () => {
    try {
      let result = await this.client.schools();
      this.dispatch(setSchools(result));
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
      return false;
    }
  };

  loadPersonalizedSuggestions = async () => {
    try {
      let result = await this.client.userSuggestions();

      this.dispatch(setPersonalizedSuggestedUsers(result));

      return result;
    } catch (e) {
      this.dispatch(addError(e.message));
      return false;
    }
  };

  loadPostRiver = async (offset) => {
    this.dispatch(setUIProgress('loadRiverInProgress', true));

    try {
      let result = await this.client.subscriptions(offset);
      this.dispatch(setPostsToRiver(result));
      this.dispatch(setUIProgress('loadRiverInProgress', false));
      return result;
    } catch (e) {
      this.dispatch(addError(e.message));
      this.dispatch(setUIProgress('loadRiverInProgress', false));
      return false;
    }
  };

  loadTagCloud = async () => {
    try {
      let result = await this.client.tagCloud();
      this.dispatch(setTagCloud(result));
    } catch (e) {
      this.dispatch(addError(e.message));
    }
  };

  checkSchoolExists = async (name) => {
    let exists;
    try {
      exists = await this.client.checkSchoolExists(name);
    } catch (e) {
      this.dispatch(addError(e.message));
      return false;
    }

    return exists;
  };

  checkGeotagExists = async (name) => {
    let exists;
    try {
      exists = await this.client.checkGeotagExists(name);
    } catch (e) {
      this.dispatch(addError(e.message));
      return false;
    }

    return exists;
  };

  loadSchoolCloud = async () => {
    try {
      let result = await this.client.schoolCloud();
      this.dispatch(setSchools(result));
      this.dispatch(setSchoolCloud(result));
    } catch (e) {
      this.dispatch(addError(e.message));
    }
  };

  loadGeotagCloud = async () => {
    try {
      let result = await this.client.geotagCloud();
      this.dispatch(setGeotagCloud(result));
    } catch (e) {
      this.dispatch(addError(e.message));
    }
  };

  followTag = async (name) => {
    try {
      let result = await this.client.followTag(name);
      this.dispatch(addUserFollowedTag(result.hashtag));
    } catch (e) {
      this.dispatch(addError(e.message));
    }
  };

  unfollowTag = async (name) => {
    try {
      let result = await this.client.unfollowTag(name);
      this.dispatch(removeUserFollowedTag(result.hashtag));
    } catch (e) {
      this.dispatch(addError(e.message));
    }
  };

  followSchool = async (name) => {
    try {
      let result = await this.client.followSchool(name);
      this.dispatch(addUserFollowedSchool(result.school));
    } catch (e) {
      this.dispatch(addError(e.message));
    }
  };

  unfollowSchool = async (name) => {
    try {
      let result = await this.client.unfollowSchool(name);
      this.dispatch(removeUserFollowedSchool(result.school));
    } catch (e) {
      this.dispatch(addError(e.message));
    }
  };

  followGeotag = async (urlName) => {
    try {
      let result = await this.client.followGeotag(urlName);
      this.dispatch(addUserFollowedGeotag(result.geotag));
    } catch (e) {
      this.dispatch(addError(e.message));
    }
  };

  unfollowGeotag = async (urlName) => {
    try {
      let result = await this.client.unfollowGeotag(urlName);
      this.dispatch(removeUserFollowedGeotag(result.geotag));
    } catch (e) {
      this.dispatch(addError(e.message));
    }
  };

  removeMessage = (id) => {
    this.dispatch(removeMessage(id))
  };

  loadUserTags = async () => {
    const userTags = await this.client.userTags();
    this.dispatch(setUserTags(userTags));
  };

  showRegisterForm = async () => {
    this.dispatch(showRegisterForm());
  };

  uploadPicture = async ({ picture, ...options }) => {
    let img;
    try {
      const original = await this.client.uploadImage([picture]);
      const originalId = original.attachments[0].id;

      const processed = await this.client.processImage(originalId, toSpreadArray(options));

      img = {
        attachment_id: processed.attachment.id,
        url: processed.attachment.s3_url
      };
    } catch (e) {
      this.dispatch(addError(e.message));
      throw e;
    }

    return img;
  };

  createComment = async (postId, comment) => {
    this.dispatch(createCommentStart(postId, comment));

    try {
      let responseBody = await this.client.createComment(postId, comment);

      if (responseBody) {
        if (responseBody.error) {
          this.dispatch(createCommentFailure(postId, responseBody.error));
        } else {
          this.dispatch(setPostComments(postId, responseBody));
          this.dispatch(createCommentSuccess(postId));
        }
      }
    } catch (e) {
      this.dispatch(addError(e.message));
    }
  };

  deleteComment = async (postId, commentId) => {
    this.dispatch(deleteCommentStart(postId, commentId));

    try {
      let responseBody = await this.client.deleteComment(postId, commentId);

      if (responseBody) {
        if (responseBody.error) {
          this.dispatch(deleteCommentFailure(postId, commentId, responseBody.error));
        } else {
          this.dispatch(setPostComments(postId, responseBody));
          this.dispatch(deleteCommentSuccess(postId, commentId));
        }
      }
    } catch (e) {
      this.dispatch(deleteCommentFailure(postId, commentId, e.message));
    }
  };

  saveComment = async (postId, commentId, text) => {
    this.dispatch(saveCommentStart(postId, commentId));

    try {
      let responseBody = await this.client.saveComment(postId, commentId, text);

      if (responseBody) {
        if (responseBody.error) {
          this.dispatch(saveCommentFailure(postId, commentId, responseBody.error));
        } else {
          this.dispatch(setPostComments(postId, responseBody));
          this.dispatch(saveCommentSuccess(postId, commentId));
        }
      }
    } catch (e) {
      this.dispatch(saveCommentFailure(postId, commentId, e.message));
    }
  };

  getCountries = async () => {
    try {
      const response = await this.client.countries();
      this.dispatch(setCountries(response));
    } catch (e) {
      console.error(`Failed to fetch countries: ${e}`);  // eslint-disable-line no-console
    }
  }
}
