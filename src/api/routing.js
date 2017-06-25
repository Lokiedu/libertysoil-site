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
import Router from 'koa-router';
import multer from 'koa-multer';

import ApiController from './controller';
import { getAuthController, getAuthProfileController, auth } from './auth';

const upload = multer({ storage: multer.memoryStorage() });

export function initApi(bookshelf, sphinx) {
  const controller = new ApiController(bookshelf, sphinx);

  const api = new Router();

  api.get('/test', controller.test);
  api.get('/test-sphinx', controller.testSphinx);
  api.head('/test', controller.testHead);
  api.delete('/test', controller.testDelete);
  api.post('/test', controller.testPost);

  api.post('/users', controller.registerUser);
  api.post('/session', controller.login);

  // Universal login/register/add provider controllers. Open in a popup.
  api.get('/auth/facebook', getAuthController('facebook', controller.passport, { resetOnlyProfile: true }));
  api.get('/auth/facebook/callback', getAuthController('facebook', controller.passport));
  api.get('/auth/google', getAuthController('google', controller.passport, { resetOnlyProfile: true }));
  api.get('/auth/google/callback', getAuthController('google', controller.passport));
  api.get('/auth/twitter', getAuthController('twitter', controller.passport, { resetOnlyProfile: true }));
  api.get('/auth/twitter/callback', getAuthController('twitter', controller.passport));
  api.get('/auth/github', getAuthController('github', controller.passport, { resetOnlyProfile: true }));
  api.get('/auth/github/callback', getAuthController('github', controller.passport));

  // These do not login/create user, only respond with a oauth profile. Open in a popup.
  api.get('/auth/profile/facebook', getAuthProfileController('facebook', controller.passport));
  api.get('/auth/profile/google', getAuthProfileController('google', controller.passport));
  api.get('/auth/profile/twitter', getAuthProfileController('twitter', controller.passport));
  api.get('/auth/profile/github', getAuthProfileController('github', controller.passport));

  api.get('/posts', auth, controller.subscriptions);
  api.get('/posts/subscriptions/hashtag', auth, controller.hashtagSubscriptions);
  api.get('/posts/subscriptions/school', auth, controller.schoolSubscriptions);
  api.get('/posts/subscriptions/geotag', auth, controller.geotagSubscriptions);
  api.post('/posts', auth, controller.createPost);
  api.get('/post/:id', controller.getPost);
  api.post('/post/:id', auth, controller.updatePost);
  api.delete('/post/:id', auth, controller.removePost);
  api.post('/post/:id/like', auth, controller.likePost);
  api.post('/post/:id/unlike', auth, controller.unlikePost);
  api.post('/post/:id/fav', auth, controller.favPost);
  api.post('/post/:id/unfav', auth, controller.unfavPost);
  api.get('/post/:id/related-posts', controller.getRelatedPosts);
  api.post('/post/:id/subscribe', auth, controller.subscribeToPost);
  api.post('/post/:id/unsubscribe', auth, controller.unsubscribeFromPost);
  api.get('/post/:id/unsubscribe', controller.getUnsubscribeFromPost);

  api.get('/post/:id/comments', controller.getPostComments);
  api.post('/post/:id/comments', auth, controller.postComment);
  api.post('/post/:id/comment/:comment_id', auth, controller.editComment);
  api.delete('/post/:id/comment/:comment_id', auth, controller.removeComment);

  api.get('/posts/all', controller.allPosts);
  api.get('/posts/user/:user', controller.userPosts);
  api.get('/posts/liked', auth, controller.currentUserLikedPosts);
  api.get('/posts/liked/:user', controller.userLikedPosts);
  api.get('/posts/favoured', auth, controller.currentUserFavouredPosts);
  api.get('/posts/favoured/:user', controller.userFavouredPosts);
  api.get('/posts/tag/:tag', controller.tagPosts);
  api.get('/posts/school/:school', controller.schoolPosts);
  api.get('/posts/geotag/:url_name', controller.geotagPosts);
  api.get('/user/tags', auth, controller.userTags);

  api.get('/school-cloud', controller.getSchoolCloud);
  api.get('/schools', controller.getSchools);
  api.post('/schools/new', auth, controller.createSchool);
  api.get('/schools-alphabet', controller.getSchoolsAlphabet);
  api.get('/schools/:query', controller.searchSchools);
  api.head('/school/:name', controller.checkSchoolExists);
  api.get('/school/:url_name', controller.getSchool);
  api.post('/school/:id', auth, controller.updateSchool);
  api.post('/school/:name/follow', auth, controller.followSchool);
  api.post('/school/:name/unfollow', auth, controller.unfollowSchool);
  api.post('/school/:url_name/like', auth, controller.likeSchool);
  api.post('/school/:url_name/unlike', auth, controller.unlikeSchool);

  api.get('/countries/', controller.getCountries);
  api.get('/country/:code', controller.getCountry);
  //api.get('/cities/', controller.getCities);
  api.get('/city/:id', controller.getCity);

  api.get('/user/recent-hashtags', auth, controller.getUserRecentHashtags);
  api.get('/user/recent-schools', auth, controller.getUserRecentSchools);
  api.get('/user/recent-geotags', auth, controller.getUserRecentGeotags);
  api.head('/user/:username', controller.checkUserExists);
  api.get('/user/:id/following', controller.getFollowedUsers);
  api.get('/user/:id/mutual-follows', controller.getMutualFollows);
  api.get('/user/:id/messages', auth, controller.getUserMessages);
  api.post('/user/:id/messages', auth, controller.sendMessage);
  api.head('/user/email/:email', controller.checkEmailTaken);
  api.get('/user/available-username/:username', controller.getAvailableUsername);
  api.get('/user/:username', controller.getUser);
  api.post('/user/:username/follow', auth, controller.followUser);
  api.post('/user/:username/unfollow', auth, controller.unfollowUser);
  api.post('/user/:username/ignore', auth, controller.ignoreUser);
  api.get('/user/:username/profile-posts', controller.getProfilePosts);

  api.get('/profile-post/:id', controller.getProfilePost);
  api.post('/profile-posts', auth, controller.createProfilePost);
  api.post('/profile-post/:id', auth, controller.updateProfilePost);
  api.delete('/profile-post/:id', auth, controller.deleteProfilePost);

  api.get('/user/verify/:hash', controller.verifyEmail);
  api.post('/user/', auth, controller.updateUser);
  api.post('/user/password', auth, controller.changePassword);

  api.post('/resetpassword', controller.resetPassword);
  api.post('/newpassword/:hash', controller.newPassword);

  api.post('/logout', controller.logout);

  api.get('/suggestions/personalized', auth, controller.userSuggestions);
  api.get('/suggestions/initial', auth, controller.initialSuggestions);

  api.post('/upload', auth, upload.array('files', 8), controller.uploadFiles);
  api.post('/image', auth, controller.processImage);

  api.get('/pickpoint', auth, controller.pickpoint);

  api.get('/tag-cloud', controller.getTagCloud);
  api.get('/tags/search/:query', controller.searchHashtags);
  api.get('/tag/:name', controller.getHashtag);
  api.post('/tag/:id', auth, controller.updateHashtag);
  api.post('/tag/:name/follow', auth, controller.followTag);
  api.post('/tag/:name/unfollow', auth, controller.unfollowTag);
  api.post('/tag/:name/like', auth, controller.likeHashtag);
  api.post('/tag/:name/unlike', auth, controller.unlikeHashtag);

  api.get('/geotag-cloud', controller.getGeotagCloud);
  api.head('/geotag/:name', controller.checkGeotagExists);
  api.get('/geotag/:url_name', controller.getGeotag);
  api.post('/geotag/:id', auth, controller.updateGeotag);
  api.get('/geotags', controller.getGeotags);
  api.get('/geotags/search/:query', controller.searchGeotags);
  api.post('/geotag/:url_name/follow', auth, controller.followGeotag);
  api.post('/geotag/:url_name/unfollow', auth, controller.unfollowGeotag);
  api.post('/geotag/:url_name/like', auth, controller.likeGeotag);
  api.post('/geotag/:url_name/unlike', auth, controller.unlikeGeotag);

  api.get('/quotes', controller.getQuotes);

  api.get('/search', controller.search);
  api.get('/search-quick/:query', controller.searchStats);

  api.get('/locale/:lang_code', controller.getLocale);

  return api.routes();
}
