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
import multer from 'multer';

import ApiController from './controller';

let upload = multer({storage: multer.memoryStorage()});

export function initApi(bookshelf) {
  let controller = new ApiController(bookshelf);

  let wrap =
    (handler) =>
      (req, res, next) =>
        handler(req, res, next)
          .catch((e) => {
            console.log(`an error was thrown from url-handler of ${req.originalUrl}:\n`, e);  // eslint-disable-line no-console

            res.status(500);
            res.send({error: 'Internal Server Error'});
          });

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
  api.get('/post/:id/related-posts', wrap(controller.getRelatedPosts.bind(controller)));

  api.get('/post/:id/comments', wrap(controller.getPostComments.bind(controller)));
  api.post('/post/:id/comments', wrap(controller.postComment.bind(controller)));
  api.post('/post/:id/comment/:comment_id', wrap(controller.editComment.bind(controller)));
  api.delete('/post/:id/comment/:comment_id', wrap(controller.removeComment.bind(controller)));

  api.get('/posts/all', wrap(controller.allPosts.bind(controller)));
  api.get('/posts/user/:user', wrap(controller.userPosts.bind(controller)));
  api.get('/posts/liked', wrap(controller.userLikedPosts.bind(controller)));
  api.get('/posts/liked/:user', wrap(controller.getLikedPosts.bind(controller)));
  api.get('/posts/favoured', wrap(controller.userFavouredPosts.bind(controller)));
  api.get('/posts/favoured/:user', wrap(controller.getFavouredPosts.bind(controller)));
  api.get('/posts/tag/:tag', wrap(controller.tagPosts.bind(controller)));
  api.get('/posts/school/:school', wrap(controller.schoolPosts.bind(controller)));
  api.get('/posts/geotag/:url_name', wrap(controller.geotagPosts.bind(controller)));
  api.get('/user/tags', wrap(controller.userTags.bind(controller)));

  api.get('/school-cloud', wrap(controller.getSchoolCloud.bind(controller)));
  api.get('/schools', wrap(controller.getSchools.bind(controller)));
  api.get('/school/:url_name', wrap(controller.getSchool.bind(controller)));
  api.post('/school/:id', wrap(controller.updateSchool.bind(controller)));
  api.post('/school/:name/follow', wrap(controller.followSchool.bind(controller)));
  api.post('/school/:name/unfollow', wrap(controller.unfollowSchool.bind(controller)));
  api.post('/school/:url_name/like', wrap(controller.likeSchool.bind(controller)));
  api.post('/school/:url_name/unlike', wrap(controller.unlikeSchool.bind(controller)));

  api.get('/countries/', wrap(controller.getCountries.bind(controller)));
  api.get('/country/:code', wrap(controller.getCountry.bind(controller)));
  //api.get('/cities/', wrap(controller.getCities.bind(controller)));
  api.get('/city/:id', wrap(controller.getCity.bind(controller)));

  api.get('/user/recent-hashtags', wrap(controller.getUserRecentHashtags.bind(controller)));
  api.get('/user/recent-schools', wrap(controller.getUserRecentSchools.bind(controller)));
  api.get('/user/recent-geotags', wrap(controller.getUserRecentGeotags.bind(controller)));
  api.head('/user/:username', wrap(controller.checkUserExists.bind(controller)));
  api.get('/user/available-username/:username', wrap(controller.getAvailableUsername.bind(controller)));
  api.get('/user/:username', wrap(controller.getUser.bind(controller)));
  api.post('/user/:username/follow', wrap(controller.followUser.bind(controller)));
  api.post('/user/:username/unfollow', wrap(controller.unfollowUser.bind(controller)));

  api.get('/user/verify/:hash', wrap(controller.verifyEmail.bind(controller)));
  api.post('/user/', wrap(controller.updateUser.bind(controller)));
  api.post('/user/password', wrap(controller.changePassword.bind(controller)));

  api.post('/resetpassword', wrap(controller.resetPassword.bind(controller)));
  api.post('/newpassword/:hash', wrap(controller.newPassword.bind(controller)));

  api.post('/logout', wrap(controller.logout.bind(controller)));

  api.get('/suggestions/personalized', wrap(controller.userSuggestions.bind(controller)));
  api.get('/suggestions/initial', wrap(controller.initialSuggestions.bind(controller)));

  api.post('/upload', upload.array('files', 8), wrap(controller.uploadFiles.bind(controller)));
  api.post('/image', wrap(controller.processImage.bind(controller)));

  api.get('/pickpoint', wrap(controller.pickpoint.bind(controller)));

  api.get('/tag-cloud', wrap(controller.getTagCloud.bind(controller)));
  api.get('/tags/search/:query', wrap(controller.searchTags.bind(controller)));
  api.post('/tag/:name/follow', wrap(controller.followTag.bind(controller)));
  api.post('/tag/:name/unfollow', wrap(controller.unfollowTag.bind(controller)));
  api.post('/tag/:name/like', wrap(controller.likeHashtag.bind(controller)));
  api.post('/tag/:name/unlike', wrap(controller.unlikeHashtag.bind(controller)));

  api.get('/geotag/:url_name', wrap(controller.getGeotag.bind(controller)));
  api.get('/geotags/search/:query', wrap(controller.searchGeotags.bind(controller)));
  api.post('/geotag/:url_name/follow', wrap(controller.followGeotag.bind(controller)));
  api.post('/geotag/:url_name/unfollow', wrap(controller.unfollowGeotag.bind(controller)));
  api.post('/geotag/:url_name/like', wrap(controller.likeGeotag.bind(controller)));
  api.post('/geotag/:url_name/unlike', wrap(controller.unlikeGeotag.bind(controller)));


  return api;
}
