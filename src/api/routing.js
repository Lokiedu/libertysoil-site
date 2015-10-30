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
import express from 'express';

import ApiController from './controller';


export function initApi(bookshelf) {
  let controller = new ApiController(bookshelf);

  let wrap = fn => (...args) => fn(...args).catch(args[2]);

  let api = express.Router();

  api.get('/test', wrap(controller.test));
  api.post('/users', wrap(controller.registerUser.bind(controller)));
  api.post('/session', wrap(controller.login.bind(controller)));

  api.get('/posts', wrap(controller.subscriptions.bind(controller)));
  api.post('/posts', wrap(controller.createPost.bind(controller)));
  api.get('/post/:id', wrap(controller.getPost.bind(controller)));
  api.post('/post/:id', wrap(controller.updatePost.bind(controller)));
  api.delete('/post/:id', wrap(controller.removePost.bind(controller)));
  api.post('/post/:id/like', wrap(controller.likePost.bind(controller)));
  api.post('/post/:id/unlike', wrap(controller.unlikePost.bind(controller)));
  api.post('/post/:id/fav', wrap(controller.favPost.bind(controller)));
  api.post('/post/:id/unfav', wrap(controller.unfavPost.bind(controller)));

  api.get('/posts/all', wrap(controller.allPosts.bind(controller)));
  api.get('/posts/user/:user', wrap(controller.userPosts.bind(controller)));
  api.get('/posts/liked', wrap(controller.userLikedPosts.bind(controller)));
  api.get('/posts/liked/:user', wrap(controller.getLikedPosts.bind(controller)));
  api.get('/posts/favoured', wrap(controller.userFavouredPosts.bind(controller)));
  api.get('/posts/favoured/:user', wrap(controller.getFavouredPosts.bind(controller)));
  api.get('/posts/tag/:tag', wrap(controller.tagPosts.bind(controller)));
  api.get('/user/tags', wrap(controller.userTags.bind(controller)));

  api.get('/user/:username', wrap(controller.getUser.bind(controller)));
  api.post('/user/:username/follow', wrap(controller.followUser.bind(controller)));
  api.post('/user/:username/unfollow', wrap(controller.unfollowUser.bind(controller)));

  api.post('/user/', wrap(controller.updateUser.bind(controller)));
  api.post('/user/password', wrap(controller.changePassword.bind(controller)));

  api.post('/logout', wrap(controller.logout.bind(controller)));

  return api;
}
