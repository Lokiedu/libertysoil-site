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
import { Map as ImmutableMap } from 'immutable';
import t from 't8on';

import { DEFAULT_LOCALE } from '../consts/localization';
import { isStorageAvailable } from '../utils/browser';
import { toSpreadArray } from '../utils/lang';
import * as a from '../actions';

const isBrowser = typeof window !== 'undefined';

const canUseStorage = isBrowser
  && process.env.DB_ENV !== 'test'
  && process.env.DB_ENV !== 'travis'
  && isStorageAvailable('localStorage');

export class ActionsTrigger {
  client;
  dispatch;

  constructor(client, dispatch) {
    this.client = client;
    this.dispatch = dispatch;
  }

  likePost = async (current_user_id, post_id) => {
    try {
      const responseBody = await this.client.like(post_id);

      if (responseBody.success) {
        this.dispatch(a.users.setLikes(current_user_id, responseBody.likes, post_id, responseBody.likers));
        await this.syncLikedPosts(current_user_id);
      } else {
        this.dispatch(a.messages.addError('internal server error. please try later'));
      }
    } catch (e) {
      this.dispatch(a.messages.addError(e.message));
    }
  };

  unlikePost = async (current_user_id, post_id) => {
    try {
      const responseBody = await this.client.unlike(post_id);

      if (responseBody.success) {
        this.dispatch(a.users.setLikes(current_user_id, responseBody.likes, post_id, responseBody.likers));
        await this.syncLikedPosts(current_user_id);
      } else {
        this.dispatch(a.messages.addError('internal server error. please try later'));
      }
    } catch (e) {
      this.dispatch(a.messages.addError(e.message));
    }
  };

  likeHashtag = async (name) => {
    try {
      const response = await this.client.likeHashtag(name);

      if (response.success) {
        this.dispatch(a.hashtags.addLikedHashtag(response.hashtag));
      } else {
        this.dispatch(a.messages.addError('internal server error. please try later'));
      }
    } catch (e) {
      this.dispatch(a.messages.addError(e.message));
    }
  };

  unlikeHashtag = async (name) => {
    try {
      const response = await this.client.unlikeHashtag(name);

      if (response.success) {
        this.dispatch(a.hashtags.removeLikedHashtag(response.hashtag));
      } else {
        this.dispatch(a.messages.addError('internal server error. please try later'));
      }
    } catch (e) {
      this.dispatch(a.messages.addError(e.message));
    }
  };

  likeSchool = async (url_name) => {
    try {
      const response = await this.client.likeSchool(url_name);

      if (response.success) {
        this.dispatch(a.schools.addLikedSchool(response.school));
      } else {
        this.dispatch(a.messages.addError('internal server error. please try later'));
      }
    } catch (e) {
      this.dispatch(a.messages.addError(e.message));
    }
  };

  unlikeSchool = async (url_name) => {
    try {
      const response = await this.client.unlikeSchool(url_name);

      if (response.success) {
        this.dispatch(a.schools.removeLikedSchool(response.school));
      } else {
        this.dispatch(a.messages.addError('internal server error. please try later'));
      }
    } catch (e) {
      this.dispatch(a.messages.addError(e.message));
    }
  };

  likeGeotag = async (url_name) => {
    try {
      const response = await this.client.likeGeotag(url_name);

      if (response.success) {
        this.dispatch(a.geotags.addLikedGeotag(response.geotag));
      } else {
        this.dispatch(a.messages.addError('internal server error. please try later'));
      }
    } catch (e) {
      this.dispatch(a.messages.addError(e.message));
    }
  };

  unlikeGeotag = async (url_name) => {
    try {
      const response = await this.client.unlikeGeotag(url_name);

      if (response.success) {
        this.dispatch(a.geotags.removeLikedGeotag(response.geotag));
      } else {
        this.dispatch(a.messages.addError('internal server error. please try later'));
      }
    } catch (e) {
      this.dispatch(a.messages.addError(e.message));
    }
  };

  syncLikedPosts = async (current_user_id) => {
    try {
      const likedPosts = await this.client.userLikedPosts();

      this.dispatch(a.river.setPostsToLikesRiver(current_user_id, likedPosts));
    } catch (e) {
      this.dispatch(a.messages.addError(e.message));
    }
  };

  favPost = async (current_user_id, post_id) => {
    try {
      const responseBody = await this.client.fav(post_id);

      if (responseBody.success) {
        this.dispatch(a.users.setFavourites(current_user_id, responseBody.favourites, post_id, responseBody.favourers));
      } else {
        this.dispatch(a.messages.addError('internal server error. please try later'));
      }
    } catch (e) {
      this.dispatch(a.messages.addError(e.message));
    }
  };

  unfavPost = async (current_user_id, post_id) => {
    try {
      const responseBody = await this.client.unfav(post_id);

      if (responseBody.success) {
        this.dispatch(a.users.setFavourites(current_user_id, responseBody.favourites, post_id, responseBody.favourers));
      } else {
        this.dispatch(a.messages.addError('internal server error. please try later'));
      }
    } catch (e) {
      this.dispatch(a.messages.addError(e.message));
    }
  };

  createPost = async (type, data) => {
    try {
      const result = await this.client.createPost(type, data);
      this.dispatch(a.posts.createPost(result));

      const userTags = await this.client.userTags();
      this.dispatch(a.tags.setUserTags(userTags));
    } catch (e) {
      this.dispatch(a.messages.addError(e.message));
    }
  };

  loadUserInfo = async (username) => {
    let status = false;
    try {
      const user = await this.client.userInfo(username);

      if ('id' in user) {
        this.dispatch(a.users.addUser(user));
        status = true;
      }
    } catch (e) {
      this.dispatch(a.messages.addError(e.messages));
    }
    return status;
  };

  updateUserInfo = async (user) => {
    let status = false;
    try {
      const res = await this.client.updateUser(user);

      if ('user' in res) {
        this.dispatch(a.messages.addMessage('Saved successfully'));
        this.dispatch(a.users.addUser(res.user));
        status = true;
      }
    } catch (e) {
      if (e.response && ('error' in e.response)) {
        this.dispatch(a.messages.addError(e.response.error));
      } else {
        this.dispatch(a.messages.addError(e.message));
      }
    }
    return status;
  };

  changePassword = async (old_password, new_password1, new_password2) => {
    if (old_password.trim() == '' || new_password1.trim() == '' || new_password2.trim() == '') {
      this.dispatch(a.messages.addError('Some of the fields are empty'));
      return false;
    }

    if (new_password1 !== new_password2) {
      this.dispatch(a.messages.addError('Passwords do not match'));
      return false;
    }

    let success = false;
    try {
      const res = await this.client.changePassword(old_password, new_password1);

      if ('success' in res && res.success === true) {
        this.dispatch(a.messages.addMessage('Password is changed successfully'));
        success = true;
      }
    } catch (e) {
      this.dispatch(a.messages.addError(e.message));
    }

    return success;
  };


  followUser = async (username) => {
    try {
      const res = await this.client.follow(username);

      if ('user1' in res) {
        this.dispatch(a.users.addUser(res.user1));
        this.dispatch(a.users.addUser(res.user2));
      }

      this.dispatch(a.river.clearRiver());
      this.loadPostRiver();
    } catch (e) {
      this.dispatch(a.messages.addError(e.message));
    }
  };

  unfollowUser = async (username) => {
    try {
      const res = await this.client.unfollow(username);

      if ('user1' in res) {
        this.dispatch(a.users.addUser(res.user1));
        this.dispatch(a.users.addUser(res.user2));
      }

      this.dispatch(a.river.clearRiver());
      this.loadPostRiver();
    } catch (e) {
      this.dispatch(a.messages.addError(e.message));
    }
  };

  ignoreUser = async (username) => {
    try {
      await this.client.ignoreUser(username);
      const result = await this.client.userSuggestions();

      this.dispatch(a.users.setPersonalizedSuggestedUsers(result));
    } catch (e) {
      this.dispatch(a.messages.addError(e.message));
    }
  };

  login = async (needRedirect, username, password) => {
    this.dispatch(a.messages.removeAllMessages());

    let user = null;

    try {
      const result = await this.client.login({ username, password });
      user = result.user;
    } catch (e) {
      // this.dispatch(a.users.setCurrentUser(null));

      if (e.response && ('error' in e.response)) {
        this.dispatch(a.messages.addError(e.response.error));
      } else if (e.status === 401) {
        this.dispatch(a.messages.addError('login.errors.invalid'));
      } else {
        // FIXME: this should be reported to developers instead (use Sentry?)
        console.warn(e);  // eslint-disable-line no-console
        this.dispatch(a.messages.addError('api.errors.internal'));
      }

      return;
    }

    try {
      this.dispatch(a.users.setCurrentUser(user));
      this.dispatch(a.users.setLikes(user.id, user.liked_posts.map(like => like.id)));
      this.dispatch(a.users.setFavourites(user.id, user.favourited_posts.map(fav => fav.id)));

      if (needRedirect) {
        browserHistory.push('/');
      }

      if (user.more) {
        const { lang } = user.more;
        if (!(lang in t.dictionary())) {
          await this.setLocale(lang);
        } else {
          this.dispatch(a.ui.setLocale(lang));
        }
      }

      if (!user.more || user.more.first_login) {
        await this.loadInitialSuggestions();
        this.dispatch(a.messages.addMessage('welcome-first-login'));
      } else {
        await this.loadPersonalizedSuggestions();
        this.dispatch(a.messages.addMessage('welcome-user'));
      }
    } catch (e) {
      this.dispatch(a.messages.addError(e.message));
    }
  };

  resetPassword = async (email) => {
    try {
      await this.client.resetPassword(email);
      this.dispatch(a.users.submitResetPassword());
    } catch (e) {
      this.dispatch(a.messages.addError('Invalid username or password'));
    }
  };

  newPassword = async (hash, password, password_repeat) => {
    try {
      await this.client.newPassword(hash, password, password_repeat);
      this.dispatch(a.users.submitNewPassword());
    } catch (e) {
      if (e.response && ('error' in e.response)) {
        this.dispatch(a.messages.addError(e.response.error));
      } else {
        this.dispatch(a.messages.addError(e.message));
      }
    }
  };

  registerUser = async (username, password, email, firstName, lastName) => {
    this.dispatch(a.messages.removeAllMessages());

    // FIXME: disable form
    try {
      const result = await this.client.registerUser({ username, password, email, firstName, lastName });

      if (result.success) {
        this.dispatch(a.users.registrationSuccess());
      }
    } catch (e) {
      // FIXME: enable form again

      if (e.response && ('error' in e.response)) {
        // FIXME: enable form again
        const errors = e.response.error;
        let message = '';

        for (const fieldName in errors) {
          const es = errors[fieldName];
          if (Array.isArray(es)) {
            es.forEach(msg => message += msg.concat('\n'));
          } else {
            message += es;
          }
        }

        this.dispatch(a.messages.addError(message));
      } else {
        this.dispatch(a.messages.addError('api.errors.internal'));
      }
    }
  };

  setQuotes = async () => {
    try {
      const result = await this.client.getQuotes();

      this.dispatch(a.quotes.setQuotes(result));
    } catch (e) {
      this.dispatch(a.messages.addError(e.message));
    }
  }

  deletePost = async (post_uuid) => {
    try {
      const result = await this.client.deletePost(post_uuid);

      if (result.error) {
        throw new Error(result.error);
      }

      const userTags = await this.client.userTags();
      this.dispatch(a.tags.setUserTags(userTags));
      this.dispatch(a.posts.removePost(post_uuid));
    } catch (e) {
      this.dispatch(a.messages.addError(e.message));
      throw e;
    }
  };

  loadUserRecentTags = async () => {
    try {
      const geotags = await this.client.userRecentGeotags();
      const schools = await this.client.userRecentSchools();
      const hashtags = await this.client.userRecentHashtags();

      this.dispatch(a.tags.setUserRecentTags({ geotags, schools, hashtags }));
    } catch (e) {
      this.dispatch(a.messages.addError(e.message));
    }
  };

  updatePost = async (post_uuid, post_fields) => {
    try {
      const result = await this.client.updatePost(post_uuid, post_fields);
      this.dispatch(a.posts.addPost(result));
    } catch (e) {
      this.dispatch(a.messages.addError(e.message));
    }
  };

  updateGeotag = async (geotag_uuid, geotag_fields) => {
    try {
      const result = await this.client.updateGeotag(geotag_uuid, geotag_fields);
      this.dispatch(a.geotags.addGeotag(result));

      return result;
    } catch (e) {
      this.dispatch(a.messages.addError(e.message));
      throw e;
    }
  };

  updateHashtag = async (hashtag_uuid, hashtag_fields) => {
    try {
      const result = await this.client.updateHashtag(hashtag_uuid, hashtag_fields);
      this.dispatch(a.hashtags.addHashtag(result));

      return result;
    } catch (e) {
      this.dispatch(a.messages.addError(e.message));
      throw e;
    }
  };

  createSchool = async (schoolFields) => {
    let school;
    try {
      school = await this.client.createSchool(schoolFields);
      this.dispatch(a.schools.addSchool(school));
      this.dispatch(a.messages.addMessage('School has been registered successfully'));
    } catch (e) {
      this.dispatch(a.messages.addError(e.message));
      throw e;
    }

    return school;
  }

  updateSchool = async (school_uuid, school_fields) => {
    try {
      const result = await this.client.updateSchool(school_uuid, school_fields);
      this.dispatch(a.schools.addSchool(result));

      return result;
    } catch (e) {
      this.dispatch(a.messages.addError(e.message));
      throw e;
    }
  };

  toolsLoadSchoolsRiver = async (query = {}, triggerUiChanges = true) => {
    if (triggerUiChanges) {
      this.dispatch(a.ui.setProgress('loadingSchoolsRiver', true));
    }

    let result;
    try {
      result = await this.client.schools({ havePosts: true, ...query });
      this.dispatch(a.schools.setSchools(result));

      if (!query.offset) {
        this.dispatch(a.tools.setSchoolsRiver(result));
      } else {
        this.dispatch(a.tools.addSchoolsToRiver(result));
      }

      if (result.length < query.limit) {
        this.dispatch(a.tools.setAllSchoolsLoaded(true));
      } else {
        this.dispatch(a.tools.setAllSchoolsLoaded(false));
      }
    } catch (e) {
      this.dispatch(a.messages.addError(e.message));
    }

    this.dispatch(a.ui.setProgress('loadingSchoolsRiver', false));

    return result;
  }

  toolsLoadUserPostsRiver = async (userName, query = {}) => {
    this.dispatch(a.ui.setProgress('loadingUserPostsRiver', true));

    let result;
    try {
      result = await this.client.userPosts(userName, query);

      if (!query.offset) {
        this.dispatch(a.tools.setUserPostsRiver(result));
      } else {
        this.dispatch(a.tools.addUserPostsToRiver(result));
      }
    } catch (e) {
      this.dispatch(a.messages.addError(e.message));
    }

    this.dispatch(a.ui.setProgress('loadingUserPostsRiver', false));

    return result;
  };

  loadInitialSuggestions = async () => {
    try {
      const result = await this.client.initialSuggestions();

      this.dispatch(a.users.addUsers(result));
      this.dispatch(a.users.setSuggestedUsers(result));

      return result;
    } catch (e) {
      this.dispatch(a.messages.addError(e.message));
      return false;
    }
  };

  loadPersonalizedSuggestions = async () => {
    try {
      const result = await this.client.userSuggestions();

      this.dispatch(a.users.setPersonalizedSuggestedUsers(result));

      return result;
    } catch (e) {
      this.dispatch(a.messages.addError(e.message));
      return false;
    }
  };

  loadAllPosts = async (query) => {
    let result = false;

    this.dispatch(a.ui.setProgress('loadAllPostsInProgress', true));

    try {
      result = await this.client.allPosts(query);

      if (query.offset && query.offset > 0) {
        this.dispatch(a.allPosts.addPosts(result));
      } else {
        this.dispatch(a.allPosts.setPosts(result));
      }
    } catch (e) {
      this.dispatch(a.messages.addError(e.message));
    }

    this.dispatch(a.ui.setProgress('loadAllPostsInProgress', false));

    return result;
  };

  loadPostRiver = async (offset) => {
    this.dispatch(a.ui.setProgress('loadRiverInProgress', true));

    try {
      const result = await this.client.subscriptions(offset);
      this.dispatch(a.river.setPostsToRiver(result));
      this.dispatch(a.ui.setProgress('loadRiverInProgress', false));
      return result;
    } catch (e) {
      this.dispatch(a.messages.addError(e.message));
      this.dispatch(a.ui.setProgress('loadRiverInProgress', false));
      return false;
    }
  };

  loadHashtagSubscriptions = async (query = { offset: 0 }) => {
    this.dispatch(a.ui.setProgress('loadHashtagSubscriptionsRiver'), true);

    let result;

    try {
      result = await this.client.hashtagSubscriptions(query);
      this.dispatch(a.river.loadHashtagSubscriptionsRiver(result));
    } catch (e) {
      this.dispatch(a.messages.reportError(a.river.LOAD_HASHTAG_SUBSCRIPTONS_RIVER, e));
      result = false;
    }

    this.dispatch(a.ui.setProgress('loadHashtagSubscriptionsRiver'), false);

    return result;
  }

  loadSchoolSubscriptions = async (query = { offset: 0 }) => {
    this.dispatch(a.ui.setProgress('loadSchoolSubscriptionsRiver'), true);

    let result;

    try {
      result = await this.client.schoolSubscriptions(query);
      this.dispatch(a.river.loadSchoolSubscriptionsRiver(result));
    } catch (e) {
      this.dispatch(a.messages.reportError(a.river.LOAD_SCHOOL_SUBSCRIPTONS_RIVER, e));
      result = false;
    }

    this.dispatch(a.ui.setProgress('loadSchoolSubscriptionsRiver'), false);

    return result;
  }

  loadGeotagSubscriptions = async (query = { offset: 0 }) => {
    this.dispatch(a.ui.setProgress('loadGeotagSubscriptionsRiver'), true);

    let result;

    try {
      result = await this.client.geotagSubscriptions(query);
      this.dispatch(a.river.loadGeotagSubscriptionsRiver(result));
    } catch (e) {
      this.dispatch(a.messages.reportError(a.river.LOAD_GEOTAG_SUBSCRIPTONS_RIVER, e));
      result = false;
    }

    this.dispatch(a.ui.setProgress('loadGeotagSubscriptionsRiver'), false);

    return result;
  }

  loadTagCloud = async () => {
    try {
      const result = await this.client.tagCloud();
      this.dispatch(a.hashtags.setHashtagCloud(result));
    } catch (e) {
      this.dispatch(a.messages.addError(e.message));
    }
  };

  checkSchoolExists = async (name) => {
    let exists;
    try {
      exists = await this.client.checkSchoolExists(name);
    } catch (e) {
      this.dispatch(a.messages.addError(e.message));
      return false;
    }

    return exists;
  };

  checkGeotagExists = async (name) => {
    let exists;
    try {
      exists = await this.client.checkGeotagExists(name);
    } catch (e) {
      this.dispatch(a.messages.addError(e.message));
      return false;
    }

    return exists;
  };

  loadSchoolCloud = async () => {
    try {
      const result = await this.client.schoolCloud();
      this.dispatch(a.schools.setSchools(result));
      this.dispatch(a.schools.setSchoolCloud(result));
    } catch (e) {
      this.dispatch(a.messages.addError(e.message));
    }
  };

  loadGeotagCloud = async () => {
    try {
      const result = await this.client.geotagCloud();
      this.dispatch(a.geotags.setGeotagCloud(result));
    } catch (e) {
      this.dispatch(a.messages.addError(e.message));
    }
  };

  followTag = async (name) => {
    try {
      const result = await this.client.followTag(name);
      this.dispatch(a.hashtags.addUserFollowedHashtag(result.hashtag));
    } catch (e) {
      this.dispatch(a.messages.addError(e.message));
    }
  };

  unfollowTag = async (name) => {
    try {
      const result = await this.client.unfollowTag(name);
      this.dispatch(a.hashtags.removeUserFollowedHashtag(result.hashtag));
    } catch (e) {
      this.dispatch(a.messages.addError(e.message));
    }
  };

  followSchool = async (name) => {
    try {
      const result = await this.client.followSchool(name);
      this.dispatch(a.schools.addUserFollowedSchool(result.school));
    } catch (e) {
      this.dispatch(a.messages.addError(e.message));
    }
  };

  unfollowSchool = async (name) => {
    try {
      const result = await this.client.unfollowSchool(name);
      this.dispatch(a.schools.removeUserFollowedSchool(result.school));
    } catch (e) {
      this.dispatch(a.messages.addError(e.message));
    }
  };

  followGeotag = async (urlName) => {
    try {
      const result = await this.client.followGeotag(urlName);
      this.dispatch(a.geotags.addUserFollowedGeotag(result.geotag));
    } catch (e) {
      this.dispatch(a.messages.addError(e.message));
    }
  };

  unfollowGeotag = async (urlName) => {
    try {
      const result = await this.client.unfollowGeotag(urlName);
      this.dispatch(a.geotags.removeUserFollowedGeotag(result.geotag));
    } catch (e) {
      this.dispatch(a.messages.addError(e.message));
    }
  };

  addError = (message) => {
    this.dispatch(a.messages.addError(message));
  };

  removeMessage = (id) => {
    this.dispatch(a.messages.removeMessage(id));
  };

  removeAllMessages = () => {
    this.dispatch(a.messages.removeAllMessages());
  };

  loadUserTags = async () => {
    const userTags = await this.client.userTags();
    this.dispatch(a.tags.setUserTags(userTags));
  };

  showRegisterForm = async () => {
    this.dispatch(a.ui.showRegisterForm());
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
      this.dispatch(a.messages.addError(e.message));
      throw e;
    }

    return img;
  };

  createComment = async (postId, comment) => {
    this.dispatch(a.comments.createCommentStart(postId, comment));

    try {
      const responseBody = await this.client.createComment(postId, comment);

      this.dispatch(a.comments.setPostComments(postId, responseBody));
      this.dispatch(a.comments.createCommentSuccess(postId));
    } catch (e) {
      if (e.response && ('error' in e.response)) {
        this.dispatch(a.comments.createCommentFailure(postId, e.response.error));
      } else {
        this.dispatch(a.messages.addError(e.message));
      }
    }
  };

  deleteComment = async (postId, commentId) => {
    this.dispatch(a.comments.deleteCommentStart(postId, commentId));

    try {
      const responseBody = await this.client.deleteComment(postId, commentId);

      this.dispatch(a.comments.setPostComments(postId, responseBody));
      this.dispatch(a.comments.deleteCommentSuccess(postId, commentId));
    } catch (e) {
      if (e.response && ('error' in e.response)) {
        this.dispatch(a.comments.deleteCommentFailure(postId, commentId, e.response.error));
      } else {
        this.dispatch(a.comments.deleteCommentFailure(postId, commentId, e.message));
      }
    }
  };

  saveComment = async (postId, commentId, text) => {
    this.dispatch(a.comments.saveCommentStart(postId, commentId));

    try {
      const responseBody = await this.client.saveComment(postId, commentId, text);

      this.dispatch(a.comments.setPostComments(postId, responseBody));
      this.dispatch(a.comments.saveCommentSuccess(postId, commentId));
    } catch (e) {
      if (e.response && ('error' in e.response)) {
        this.dispatch(a.comments.deleteCommentFailure(postId, commentId, e.response.error));
      } else {
        this.dispatch(a.comments.saveCommentFailure(postId, commentId, e.message));
      }
    }
  };

  getCountries = async () => {
    try {
      const response = await this.client.countries();
      this.dispatch(a.geo.setCountries(response));
    } catch (e) {
      console.error(`Failed to fetch countries: ${e}`);  // eslint-disable-line no-console
    }
  }

  search = async (query, more) => {
    try {
      const response = await this.client.search(query);
      this.dispatch(a.search.setSearchResults(response, more));
    } catch (e) {
      this.dispatch(a.search.clearSearchResults(more.searchId));
      this.dispatch(a.messages.addError(e.message));
    }
  }

  subscribeToPost = async (postId) => {
    try {
      await this.client.subscribeToPost(postId);
      this.dispatch(a.users.subscribeToPost(postId));
    } catch (e) {
      this.dispatch(a.messages.addError(e.message));
    }
  }

  unsubscribeFromPost = async (postId) => {
    try {
      await this.client.unsubscribeFromPost(postId);
      this.dispatch(a.users.unsubscribeFromPost(postId));
    } catch (e) {
      this.dispatch(a.messages.addError(e.message));
    }
  }

  sendMessage = async (userId, text) => {
    try {
      const message = await this.client.sendMessage(userId, text);
      this.dispatch(a.userMessages.addUserMessage(userId, message));
    } catch (e) {
      this.dispatch(a.messages.addError(e.message));
    }
  }

  updateUserMessages = async (userId) => {
    try {
      const messages = await this.client.userMessages(userId);
      this.dispatch(a.userMessages.setUserMessages(userId, messages));
    } catch (e) {
      this.dispatch(a.messages.addError(e.message));
    }
  }

  loadUserProfilePosts = async (username, offset = 0, limit = 10) => {
    this.dispatch(a.ui.setProgress('loadProfilePostsInProgress', true));

    let result;
    try {
      result = await this.client.profilePosts(username, offset, limit);
      if (result.length > 0) {
        this.dispatch(a.posts.setProfilePosts(
          result[0].user_id,
          result,
          offset
        ));
      }
    } catch (e) {
      this.dispatch(a.messages.addError(e.message));
    }

    this.dispatch(a.ui.setProgress('loadProfilePostsInProgress', false));
    return result;
  }

  createProfilePost = async (attrs) => {
    let success = false;
    try {
      const post = await this.client.createProfilePost(attrs);
      this.dispatch(a.posts.addProfilePost(post));
      success = true;
    } catch (e) {
      this.dispatch(a.messages.addError(e.message));
    }
    return success;
  }

  updateProfilePost = async (profilePostId, attrs) => {
    let success = false;
    try {
      const post = await this.client.updateProfilePost(profilePostId, attrs);
      this.dispatch(a.posts.updateProfilePost(post));
      success = true;
    } catch (e) {
      this.dispatch(a.messages.addError(e.message));
    }
    return success;
  }

  removeProfilePost = async (profilePost, user) => {
    const postId = profilePost.get('id');
    const userId = profilePost.get('user_id');
    const postType = profilePost.get('type');

    let success = false;
    try {
      if (postType === 'avatar' || postType === 'head_pic') {
        const userpic = user.getIn(['more', postType], ImmutableMap());
        if (userpic.get('attachment_id') === profilePost.getIn(['more', 'attachment_id'])) {
          const result = await this.client.updateUser({ more: { [postType]: null } });
          if ('user' in result) {
            this.dispatch(a.users.addUser(result.user));
          } else {
            return success;
          }
        }
      }

      const result = await this.client.deleteProfilePost(postId);
      success = result.success;
      if (success) {
        this.dispatch(a.posts.removeProfilePost(postId, userId));
      }
    } catch (e) {
      this.dispatch(a.messages.addError(e.message));
    }
    return success;
  }

  loadContinentNav = async (continentId) => {
    try {
      const [continents, countries] = await Promise.all([
        this.client.getGeotags({ type: 'Continent', sort: 'url_name' }),
        this.client.getGeotags({
          continent_id: continentId,
          limit: 3,
          sort: '-hierarchy_post_count',
          type: 'Country'
        })
      ]);

      this.dispatch(a.geotags.setContinentNav(continents, countries));
    } catch (e) {
      this.dispatch(a.messages.addError(e.message));
    }
  };

  setLocale = async (_code) => {
    let code = _code;

    if (!code) {
      if (canUseStorage) {
        code = window.localStorage.getItem('locale') || DEFAULT_LOCALE;
      } else {
        code = DEFAULT_LOCALE;
      }
    }

    let success = false;
    try {
      let locale;
      if (process.env.NODE_ENV === 'production') {
        locale = await this.client.getLocale(code);
      } else {
        locale = require(`../../res/locale/${code}.json`); // eslint-disable-line prefer-template
      }

      if (isBrowser) {
        t
          .setLocale(code, locale)
          .currentLocale = code;
        if (canUseStorage) {
          window.localStorage.setItem('locale', code);
        }
      }

      this.dispatch(a.ui.setLocale(code));
      success = true;
    } catch (e) {
      this.dispatch(a.messages.addError(e.message));
    }

    return success;
  };

  loadGeotags = async (query = {}) => {
    try {
      const response = await this.client.getGeotags(query);
      this.dispatch(a.geotags.addGeotags(response));
    } catch (e) {
      this.dispatch(a.messages.addError(e.message));
    }
  };
}
