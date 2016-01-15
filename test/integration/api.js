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
/* eslint-env node, mocha */
/* global $dbConfig */
import { v4 as uuid4 } from 'uuid';

import expect from '../../test-helpers/expect';
import initBookshelf from '../../src/api/db';
import { login, POST_DEFAULT_TYPE } from '../../test-helpers/api';


let bookshelf = initBookshelf($dbConfig);
let Post = bookshelf.model('Post');
let User = bookshelf.model('User');

describe('api version 1', () => {

  describe('Posts', () => {
    let post, user;

    beforeEach(async () => {
      await bookshelf.knex('users').del();
      await bookshelf.knex('posts').del();

      user = await User.create('test', 'test', 'test@example.com');
      await user.save({'email_check_hash': ''},{require:true});

      post = new Post({
        id: uuid4(),
        type: POST_DEFAULT_TYPE,
        user_id: user.get('id')
      });
      await post.save(null, {method: 'insert'});

    });

    afterEach(async () => {
      await post.destroy();
      await user.destroy();
    });

    describe('When user not logged it', () => {

      it('CAN read post', async () => {
        await expect(`/api/v1/post/${post.id}`, 'to open successfully');
      });

      it('CAN read all post', async () => {
        await expect(`/api/v1/posts/all`, 'to open successfully');
      });

      it('CAN read other user posts', async () => {
        await expect(`/api/v1/posts/user/${user.id}`, 'to open successfully');
      });

      it('CAN read other user liked posts', async () => {
        await expect(`/api/v1/posts/liked/${user.id}`, 'to open successfully');
      });

      it('CAN read other user favoured posts', async () => {
        await expect(`/api/v1/posts/favoured/${user.id}`, 'to open successfully');
      });

      it('CAN read posts by tag', async () => {
        await expect(`/api/v1/posts/tag/test`, 'to open successfully');
      });

      it('CAN read posts by school', async () => {
        await expect(`/api/v1/posts/school/test`, 'to open successfully');
      });

      it('CAN NOT get post list', async () => {
        await expect({ url: '/api/v1/posts' }, 'not to open');
      });

      it('CAN NOT open liked posts page', async () => {
        await expect({ url: '/api/v1/posts/liked' }, 'not to open');
      });

      it('CAN NOT open favoured posts page', async () => {
        await expect({ url: '/api/v1/posts/favoured' }, 'not to open');
      });

      it('CAN NOT create post', async () => {
        await expect({ url: '/api/v1/posts', method: 'POST' }, 'not to open');
      });

      it('CAN NOT update post', async () => {
        await expect({ url: `/api/v1/post/${post.id}`, method: 'POST' }, 'not to open');
      });

      it('CAN NOT delete post', async () => {
        await expect({ url: `/api/v1/post/${post.id}`, method: 'DELETE' }, 'not to open');
      });

      it('CAN NOT like post', async () => {
        await expect({ url: `/api/v1/post/${post.id}/like`, method: 'POST' }, 'not to open');
      });

      it('CAN NOT unlike post', async () => {
        await expect({ url: `/api/v1/post/${post.id}/unlike`, method: 'POST' }, 'not to open');
      });

      it('CAN NOT fav post', async () => {
        await expect({ url: `/api/v1/post/${post.id}/fav`, method: 'POST' }, 'not to open');
      });

      it('CAN NOT unfav post', async () => {
        await expect({ url: `/api/v1/post/${post.id}/unfav`, method: 'POST' }, 'not to open');
      });

    });

    describe('When user logged in it', () => {
      let sessionId, otherPost;

      beforeEach(async () => {
        otherPost = new Post({
          id: uuid4(),
          type: POST_DEFAULT_TYPE
        });
        await otherPost.save(null, {method: 'insert'});
        sessionId = await login('test', 'test');
      });

      afterEach(async () => {
        otherPost.destroy();
      });

      it('CAN update own post', async () => {
        await expect({ url: `/api/v1/post/${post.id}`, session: sessionId, method: 'POST' }, 'to open successfully');
      });

      it('CAN create post', async () => {
        await expect({ url: `/api/v1/posts`, session: sessionId, method: 'POST', body: {type: POST_DEFAULT_TYPE, text: ''}}, 'to open successfully');
      });

      it('CAN delete own post', async () => {
        await expect({ url: `/api/v1/post/${post.id}`, session: sessionId, method: 'DELETE' }, 'to open successfully');
      });

      it('CAN like other post', async () => {
        await expect({ url: `/api/v1/post/${otherPost.id}/like`, session: sessionId, method: 'POST' }, 'to open successfully');
      });

      it('CAN unlike other post', async () => {
        await expect({ url: `/api/v1/post/${otherPost.id}/unlike`, session: sessionId, method: 'POST' }, 'to open successfully');
      });

      it('CAN fav other post', async () => {
        await expect({ url: `/api/v1/post/${otherPost.id}/fav`, session: sessionId, method: 'POST' }, 'to open successfully');
      });

      it('CAN unfav other post', async () => {
        await expect({ url: `/api/v1/post/${otherPost.id}/unfav`, session: sessionId, method: 'POST' }, 'to open successfully');
      });

      it('CAN read own liked posts', async () => {
        await expect({ url: `/api/v1/posts/liked`, session: sessionId }, 'to open successfully');
      });

      it('CAN read own favoured posts', async () => {
        await expect({ url: `/api/v1/posts/favoured`, session: sessionId }, 'to open successfully');
      });

      it('CAN NOT delete other post', async () => {
        await expect({ url: `/api/v1/post/${otherPost.id}`, session: sessionId, method: 'DELETE' }, 'not to open');
      });

    });

  });

});
