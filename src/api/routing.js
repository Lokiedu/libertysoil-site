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

  api.get('/posts', controller.subscriptions);
  api.post('/posts', controller.createPost);
  api.get('/post/:id', controller.getPost);
  api.post('/post/:id', controller.updatePost);
  api.delete('/post/:id', controller.removePost);
  api.post('/post/:id/like', controller.likePost);
  api.post('/post/:id/unlike', controller.unlikePost);
  api.post('/post/:id/fav', controller.favPost);
  api.post('/post/:id/unfav', controller.unfavPost);
  api.get('/post/:id/related-posts', controller.getRelatedPosts);
  api.post('/post/:id/subscribe', controller.subscribeToPost);
  api.post('/post/:id/unsubscribe', controller.unsubscribeFromPost);
  api.get('/post/:id/unsubscribe', controller.getUnsubscribeFromPost);

  api.get('/post/:id/comments', controller.getPostComments);
  api.post('/post/:id/comments', controller.postComment);
  api.post('/post/:id/comment/:comment_id', controller.editComment);
  api.delete('/post/:id/comment/:comment_id', controller.removeComment);

  api.get('/posts/all', controller.allPosts);
  api.get('/posts/user/:user', controller.userPosts);
  api.get('/posts/liked', controller.currentUserLikedPosts);
  api.get('/posts/liked/:user', controller.userLikedPosts);
  api.get('/posts/favoured', controller.currentUserFavouredPosts);
  api.get('/posts/favoured/:user', controller.userFavouredPosts);
  api.get('/posts/tag/:tag', controller.tagPosts);
  api.get('/posts/school/:school', controller.schoolPosts);
  api.get('/posts/geotag/:url_name', controller.geotagPosts);
  api.get('/user/tags', controller.userTags);

  api.get('/school-cloud', controller.getSchoolCloud);
  api.get('/schools', controller.getSchools);
  api.get('/schools/:query', controller.searchSchools);
  api.head('/school/:name', controller.checkSchoolExists);
  api.get('/school/:url_name', controller.getSchool);
  api.post('/school/:id', controller.updateSchool);
  api.post('/school/:name/follow', controller.followSchool);
  api.post('/school/:name/unfollow', controller.unfollowSchool);
  api.post('/school/:url_name/like', controller.likeSchool);
  api.post('/school/:url_name/unlike', controller.unlikeSchool);

  api.get('/countries/', controller.getCountries);
  api.get('/country/:code', controller.getCountry);
  //api.get('/cities/', controller.getCities);
  api.get('/city/:id', controller.getCity);

  api.get('/user/recent-hashtags', controller.getUserRecentHashtags);
  api.get('/user/recent-schools', controller.getUserRecentSchools);
  api.get('/user/recent-geotags', controller.getUserRecentGeotags);
  api.head('/user/:username', controller.checkUserExists);
  api.head('/user/email/:email', controller.checkEmailTaken);
  api.get('/user/available-username/:username', controller.getAvailableUsername);
  api.get('/user/:username', controller.getUser);
  api.post('/user/:username/follow', controller.followUser);
  api.post('/user/:username/unfollow', controller.unfollowUser);
  api.post('/user/:username/ignore', controller.ignoreUser);

  api.get('/user/verify/:hash', controller.verifyEmail);
  api.post('/user/', controller.updateUser);
  api.post('/user/password', controller.changePassword);

  api.post('/resetpassword', controller.resetPassword);
  api.post('/newpassword/:hash', controller.newPassword);

  api.post('/logout', controller.logout);

  api.get('/suggestions/personalized', controller.userSuggestions);
  api.get('/suggestions/initial', controller.initialSuggestions);

  api.post('/upload', upload.array('files', 8), controller.uploadFiles);
  api.post('/image', controller.processImage);

  api.get('/pickpoint', controller.pickpoint);

  api.get('/tag-cloud', controller.getTagCloud);
  api.get('/tags/search/:query', controller.searchHashtags);
  api.get('/tag/:name', controller.getHashtag);
  api.post('/tag/:id', controller.updateHashtag);
  api.post('/tag/:name/follow', controller.followTag);
  api.post('/tag/:name/unfollow', controller.unfollowTag);
  api.post('/tag/:name/like', controller.likeHashtag);
  api.post('/tag/:name/unlike', controller.unlikeHashtag);

  api.get('/geotag-cloud', controller.getGeotagCloud);
  api.head('/geotag/:name', controller.checkGeotagExists);
  api.get('/geotag/:url_name', controller.getGeotag);
  api.post('/geotag/:id', controller.updateGeotag);
  api.get('/geotags/search/:query', controller.searchGeotags);
  api.post('/geotag/:url_name/follow', controller.followGeotag);
  api.post('/geotag/:url_name/unfollow', controller.unfollowGeotag);
  api.post('/geotag/:url_name/like', controller.likeGeotag);
  api.post('/geotag/:url_name/unlike', controller.unlikeGeotag);

  api.get('/quotes', controller.getQuotes);

  api.get('/search/:query', controller.search);
  api.get('/search-quick/:query', controller.searchStats);


  return api.routes();
}
