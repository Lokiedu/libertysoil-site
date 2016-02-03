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


let upload = multer({storage: multer.memoryStorage()});

export function initApi(bookshelf) {
  let controller = new ApiController(bookshelf);

  let api = new Router();

  api.get('/test', controller.test);
  api.post('/users', controller.registerUser.bind(controller));
  api.post('/session', controller.login.bind(controller));

  api.get('/posts', controller.subscriptions.bind(controller));
  api.post('/posts', controller.createPost.bind(controller));
  api.get('/post/:id', controller.getPost.bind(controller));
  api.post('/post/:id', controller.updatePost.bind(controller));
  api.del('/post/:id', controller.removePost.bind(controller));
  api.post('/post/:id/like', controller.likePost.bind(controller));
  api.post('/post/:id/unlike', controller.unlikePost.bind(controller));
  api.post('/post/:id/fav', controller.favPost.bind(controller));
  api.post('/post/:id/unfav', controller.unfavPost.bind(controller));

  api.get('/posts/all', controller.allPosts.bind(controller));
  api.get('/posts/user/:user', controller.userPosts.bind(controller));
  api.get('/posts/liked', controller.userLikedPosts.bind(controller));
  api.get('/posts/liked/:user', controller.getLikedPosts.bind(controller));
  api.get('/posts/favoured', controller.userFavouredPosts.bind(controller));
  api.get('/posts/favoured/:user', controller.getFavouredPosts.bind(controller));
  api.get('/posts/tag/:tag', controller.tagPosts.bind(controller));
  api.get('/posts/school/:school', controller.schoolPosts.bind(controller));
  api.get('/posts/geotag/:url_name', controller.geotagPosts.bind(controller));
  api.get('/user/tags', controller.userTags.bind(controller));

  api.get('/schools', controller.getSchools.bind(controller));
  api.get('/school/:url_name', controller.getSchool.bind(controller));
  api.post('/school/:id', controller.updateSchool.bind(controller));
  api.post('/school/:name/follow', controller.followSchool.bind(controller));
  api.post('/school/:name/unfollow', controller.unfollowSchool.bind(controller));

  api.get('/countries/', controller.getCountries.bind(controller));
  api.get('/country/:code', controller.getCountry.bind(controller));
  //api.get('/cities/', controller.getCities.bind(controller));
  api.get('/city/:id', controller.getCity.bind(controller));

  api.get('/user/:username', controller.getUser.bind(controller));
  api.post('/user/:username/follow', controller.followUser.bind(controller));
  api.post('/user/:username/unfollow', controller.unfollowUser.bind(controller));

  api.get('/user/verify/:hash', controller.verifyEmail.bind(controller));
  api.post('/user/', controller.updateUser.bind(controller));
  api.post('/user/password', controller.changePassword.bind(controller));

  api.post('/resetpassword', controller.resetPassword.bind(controller));
  api.post('/newpassword/:hash', controller.newPassword.bind(controller));

  api.post('/logout', controller.logout.bind(controller));

  api.get('/suggestions/personalized', controller.userSuggestions.bind(controller));
  api.get('/suggestions/initial', controller.initialSuggestions.bind(controller));

  api.post('/upload', upload.array('files', 8), controller.uploadFiles.bind(controller));
  api.post('/image', controller.processImage.bind(controller));

  api.get('/pickpoint', controller.pickpoint.bind(controller));

  api.get('/tag-cloud', controller.getTagCloud.bind(controller));
  api.post('/tag/:name/follow', controller.followTag.bind(controller));
  api.post('/tag/:name/unfollow', controller.unfollowTag.bind(controller));

  api.get('/geotag/:url_name', controller.getGeotag.bind(controller));
  api.get('/geotags/search/:query', controller.searchGeotags.bind(controller));
  api.post('/geotag/:url_name/follow', controller.followGeotag.bind(controller));
  api.post('/geotag/:url_name/unfollow', controller.unfollowGeotag.bind(controller));

  return api.routes();
}
