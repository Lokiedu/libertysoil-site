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

import { FACEBOOK_CLIENT_ID, GOOGLE_CLIENT_ID, TWITTER_CONSUMER_KEY, GITHUB_CLIENT_ID } from './env';
import { getAuthController, getAuthProfileController, auth, setUpPassport } from './auth';
import * as test from './controllers/test';
import * as users from './controllers/users';
import * as posts from './controllers/posts';
import * as comments from './controllers/comments';
import * as profilePosts from './controllers/profilePosts';
import * as misc from './controllers/misc';
import * as search from './controllers/search';
import * as geo from './controllers/geo';
import * as attachments from './controllers/attachments';
import * as hashtags from './controllers/hashtags';
import * as schools from './controllers/schools';
import * as geotags from './controllers/geotags';

const upload = multer({ storage: multer.memoryStorage() });

export function initApi(bookshelf) {
  const passport = setUpPassport(bookshelf);
  const api = new Router();

  api.get('/test', test.test);
  api.get('/test-sphinx', test.testSphinx);
  api.head('/test', test.testHead);
  api.delete('/test', test.testDelete);
  api.post('/test', test.testPost);

  api.post('/users', users.registerUser);
  api.post('/session', users.login);

  // Universal login/register/add provider controllers. Open in a popup.
  // /auth/profile controllers may be used to get a user profile without authentication.
  if (FACEBOOK_CLIENT_ID) {
    api.get('/auth/facebook', getAuthController('facebook', passport, { resetOnlyProfile: true }));
    api.get('/auth/facebook/callback', getAuthController('facebook', passport));
    api.get('/auth/profile/facebook', getAuthProfileController('facebook', passport));
  }
  if (GOOGLE_CLIENT_ID) {
    api.get('/auth/google', getAuthController('google', passport, { resetOnlyProfile: true }));
    api.get('/auth/google/callback', getAuthController('google', passport));
    api.get('/auth/profile/google', getAuthProfileController('google', passport));
  }

  if (TWITTER_CONSUMER_KEY) {
    api.get('/auth/twitter', getAuthController('twitter', passport, { resetOnlyProfile: true }));
    api.get('/auth/twitter/callback', getAuthController('twitter', passport));
    api.get('/auth/profile/twitter', getAuthProfileController('twitter', passport));
  }

  if (GITHUB_CLIENT_ID) {
    api.get('/auth/github', getAuthController('github', passport, { resetOnlyProfile: true }));
    api.get('/auth/github/callback', getAuthController('github', passport));
    api.get('/auth/profile/github', getAuthProfileController('github', passport));
  }

  api.get('/posts', auth, posts.subscriptions);
  api.get('/posts/subscriptions/hashtag', auth, posts.hashtagSubscriptions);
  api.get('/posts/subscriptions/school', auth, posts.schoolSubscriptions);
  api.get('/posts/subscriptions/geotag', auth, posts.geotagSubscriptions);
  api.post('/posts', auth, posts.createPost);
  api.get('/post/:id', posts.getPost);
  api.post('/post/:id', auth, posts.updatePost);
  api.delete('/post/:id', auth, posts.removePost);
  api.post('/post/:id/like', auth, posts.likePost);
  api.post('/post/:id/unlike', auth, posts.unlikePost);
  api.post('/post/:id/fav', auth, posts.favPost);
  api.post('/post/:id/unfav', auth, posts.unfavPost);
  api.get('/post/:id/related-posts', posts.getRelatedPosts);
  api.post('/post/:id/subscribe', auth, posts.subscribeToPost);
  api.post('/post/:id/unsubscribe', auth, posts.unsubscribeFromPost);
  api.get('/post/:id/unsubscribe', posts.getUnsubscribeFromPost);

  api.get('/post/:id/comments', comments.getPostComments);
  api.post('/post/:id/comments', auth, comments.postComment);
  api.post('/post/:id/comment/:comment_id', auth, comments.editComment);
  api.delete('/post/:id/comment/:comment_id', auth, comments.removeComment);

  api.get('/posts/all', posts.allPosts);
  api.get('/posts/user/:user', posts.userPosts);
  api.get('/posts/liked', auth, posts.currentUserLikedPosts);
  api.get('/posts/liked/:user', posts.userLikedPosts);
  api.get('/posts/favoured', auth, posts.currentUserFavouredPosts);
  api.get('/posts/favoured/:user', posts.userFavouredPosts);
  api.get('/posts/tag/:tag', posts.hashtagPosts);
  api.get('/posts/school/:school', posts.schoolPosts);
  api.get('/posts/geotag/:url_name', posts.geotagPosts);

  api.get('/user/tags', auth, misc.userTags);

  api.get('/school-cloud', schools.getSchoolCloud);
  api.get('/schools', schools.getSchools);
  api.post('/schools/new', auth, schools.createSchool);
  api.get('/schools-alphabet', schools.getSchoolsAlphabet);
  api.get('/schools/:query', schools.searchSchools);
  api.head('/school/:name', schools.checkSchoolExists);
  api.get('/school/:url_name', schools.getSchool);
  api.post('/school/:id', auth, schools.updateSchool);
  api.post('/school/:name/follow', auth, schools.followSchool);
  api.post('/school/:name/unfollow', auth, schools.unfollowSchool);
  api.post('/school/:url_name/like', auth, schools.likeSchool);
  api.post('/school/:url_name/unlike', auth, schools.unlikeSchool);

  api.get('/countries/', geotags.getCountries);
  api.get('/country/:code', geo.getCountry);
  //api.get('/cities/', controller.getCities);
  api.get('/city/:id', geo.getCity);
  api.get('/pickpoint', auth, geo.pickpoint);

  api.get('/user/recent-hashtags', auth, hashtags.getUserRecentHashtags);
  api.get('/user/recent-schools', auth, schools.getUserRecentSchools);
  api.get('/user/recent-geotags', auth, geotags.getUserRecentGeotags);
  api.head('/user/:username', users.checkUserExists);
  api.get('/user/:id/following', users.getFollowedUsers);
  api.get('/user/:id/mutual-follows', users.getMutualFollows);
  // User messages are being redesigned. Temporarily (?) disabled.
  // api.get('/user/:id/messages', auth, controller.getUserMessages);
  // api.post('/user/:id/messages', auth, controller.sendMessage);
  api.head('/user/email/:email', users.checkEmailTaken);
  api.get('/user/available-username/:username', users.getAvailableUsername);
  api.get('/user/:username', users.getUser);
  api.post('/user/:username/follow', auth, users.followUser);
  api.post('/user/:username/unfollow', auth, users.unfollowUser);
  api.post('/user/:username/ignore', auth, users.ignoreUser);
  api.get('/user/:username/profile-posts', profilePosts.getProfilePosts);

  api.get('/profile-post/:id', profilePosts.getProfilePost);
  api.post('/profile-posts', auth, profilePosts.createProfilePost);
  api.post('/profile-post/:id', auth, profilePosts.updateProfilePost);
  api.delete('/profile-post/:id', auth, profilePosts.deleteProfilePost);

  api.get('/user/verify/:hash', users.verifyEmail);
  api.post('/user/', auth, users.updateUser);
  api.post('/user/password', auth, users.changePassword);
  api.post('/resetpassword', users.resetPassword);
  api.post('/newpassword/:hash', users.newPassword);
  api.post('/logout', users.logout);
  api.get('/suggestions/personalized', auth, users.userSuggestions);
  api.get('/suggestions/initial', auth, users.initialSuggestions);

  api.post('/upload', auth, upload.array('files', 8), attachments.uploadFiles);
  api.post('/image', auth, attachments.processImage);

  api.get('/tag-cloud', hashtags.getHashtagCloud);
  api.get('/tags/search/:query', hashtags.searchHashtags);
  api.get('/tag/:name', hashtags.getHashtag);
  api.post('/tag/:id', auth, hashtags.updateHashtag);
  api.post('/tag/:name/follow', auth, hashtags.followHashtag);
  api.post('/tag/:name/unfollow', auth, hashtags.unfollowHashtag);
  api.post('/tag/:name/like', auth, hashtags.likeHashtag);
  api.post('/tag/:name/unlike', auth, hashtags.unlikeHashtag);

  api.get('/geotag-cloud', geotags.getGeotagCloud);
  api.head('/geotag/:name', geotags.checkGeotagExists);
  api.get('/geotag/:url_name', geotags.getGeotag);
  api.post('/geotag/:id', auth, geotags.updateGeotag);
  api.get('/geotags', geotags.getGeotags);
  api.get('/geotags/search/:query', geotags.searchGeotags);
  api.post('/geotag/:url_name/follow', auth, geotags.followGeotag);
  api.post('/geotag/:url_name/unfollow', auth, geotags.unfollowGeotag);
  api.post('/geotag/:url_name/like', auth, geotags.likeGeotag);
  api.post('/geotag/:url_name/unlike', auth, geotags.unlikeGeotag);

  api.get('/recent-tags', misc.getRecentlyUsedTags);

  api.get('/quotes', misc.getQuotes);

  api.get('/search', search.search);
  api.get('/search-quick/:query', search.searchStats);

  api.get('/locale/:lang_code', misc.getLocale);

  return api.routes();
}
