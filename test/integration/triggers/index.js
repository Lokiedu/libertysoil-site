
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
import { serialize } from 'cookie';
import uuid from 'uuid';

import expect from '../../../test-helpers/expect';
import initBookshelf from '../../../src/api/db';
import { login } from '../../../test-helpers/api';
import { initState } from '../../../src/store';
import { ActionsTrigger } from '../../../src/triggers';
import ApiClient from '../../../src/api/client';
import { API_HOST } from '../../../src/config';
import UserFactory from '../../../test-helpers/factories/user';
import PostFactory from '../../../test-helpers/factories/post';


const bookshelf = initBookshelf($dbConfig);
const User = bookshelf.model('User');
const Post = bookshelf.model('Post');
const Comment = bookshelf.model('Comment');


describe('ActionsTrigger', () => {
  describe('Anonymous user', async () => {
    describe('#newPassword', async () => {
      let user, userAttrs, client;

      beforeEach(async () => {
        userAttrs = UserFactory.build();
        user = await User.create(userAttrs.username, userAttrs.password, userAttrs.email);
        client = new ApiClient(API_HOST);
      });

      afterEach(async () => {
        await user.destroy();
      });

      it('should dispatch error for non existing hash', async () => {
        const store = initState();
        const triggers = new ActionsTrigger(client, store.dispatch);
        await triggers.newPassword('nonexistinghash', 'test', 'test');
        expect(store.getState().get('messages').first().get('message'), 'to equal', 'Unauthorized');
      });

      it('should work', async () => {
        const store = initState();
        const triggers = new ActionsTrigger(client, store.dispatch);
        user.set('reset_password_hash', 'hash');
        await user.save(null, { method: 'update' });

        await triggers.newPassword('hash', 'test', 'test');
        expect(store.getState().getIn(['ui', 'submitNewPassword']), 'to be true');
      });

      it('validation should work when passwords do not match', async () => {
        const store = initState();
        const triggers = new ActionsTrigger(client, store.dispatch);
        user.set('reset_password_hash', 'hash');
        await user.save(null, { method: 'update' });

        await triggers.newPassword('hash', 'test1', 'test2');
        expect(store.getState().get('messages').first().get('message'), 'to equal', '"password" and "password_repeat" do not exact match.');
      });

      it('validation should work when no password_repeat provided', async () => {
        const store = initState();
        const triggers = new ActionsTrigger(client, store.dispatch);
        user.set('reset_password_hash', 'hash');
        await user.save(null, { method: 'update' });

        await triggers.newPassword('hash', 'test1');
        expect(store.getState().get('messages').first().get('message'), 'to equal', '"password" or "password_repeat" parameter is not provided');
      });
    });

    describe('#registerUser', async () => {
      it('should work', async () => {
        const userAttrs = UserFactory.build();
        const client = new ApiClient(API_HOST);
        const store = initState();
        const triggers = new ActionsTrigger(client, store.dispatch);

        await triggers.registerUser(undefined, undefined, undefined, userAttrs.firstName, userAttrs.lastName);
        expect(
          store.getState().getIn(['messages', 0, 'message']),
          'to equal',
          'The username is required\nThe password is required\nThe email is required\n'
        );
      });
    });

    describe('#login', async () => {
      it('should dispatch correct error for non existing user', async () => {
        const store = initState();
        const client = new ApiClient(API_HOST);
        const triggers = new ActionsTrigger(client, store.dispatch);
        await triggers.login('nonexisting', 'password');

        expect(store.getState().get('messages').first().get('message'), 'to equal', 'login.errors.invalid');
      });

      it('should dispatch correct error for user with not validated email', async () => {
        const userAttrs = UserFactory.build();
        const user = await User.create(userAttrs.username, userAttrs.password, userAttrs.email);
        const store = initState();
        const client = new ApiClient(API_HOST);
        const triggers = new ActionsTrigger(client, store.dispatch);
        await triggers.login(false, userAttrs.username, userAttrs.password);

        expect(store.getState().get('messages').first().get('message'), 'to equal', 'login.errors.email_unchecked');
        await user.destroy();
      });
    });
  });

  describe('Authenticated User', async () => {
    let user, triggers, client;

    beforeEach(async () => {
      const userAttrs = UserFactory.build();
      user = await User.create(userAttrs.username, userAttrs.password, userAttrs.email);

      user.set('email_check_hash', null);
      await user.save(null, { method: 'update' });
      const sessionId = await login(userAttrs.username, userAttrs.password);
      const headers = {
        "cookie": serialize('connect.sid', sessionId)
      };

      client = new ApiClient(API_HOST, { headers });
    });

    afterEach(async () => {
      await user.destroy();
      await bookshelf.knex('posts').del();
      await bookshelf.knex('comments').del();
    });

    it('createPost should work', async () => {
      const store = initState();
      triggers = new ActionsTrigger(client, store.dispatch);
      await triggers.createPost('short_text', { text_source: 'lorem ipsum' });

      expect(store.getState().get('river').size, 'to equal', 1);
    });

    it('#updateUserInfo should work', async () => {
      let store = initState();
      triggers = new ActionsTrigger(client, store.dispatch);

      await triggers.updateUserInfo({});
      expect(store.getState().get('messages').first().get('message'), 'to equal', 'Bad Request');

      store = initState();
      triggers = new ActionsTrigger(client, store.dispatch);

      await triggers.updateUserInfo({ more: {} });
      expect(store.getState().get('messages').first().get('message'), 'to equal', 'Saved successfully');
    });

    it('#createComment should dispatch correct error for non existing pos', async () => {
      let store = initState();
      triggers = new ActionsTrigger(client, store.dispatch);

      await triggers.createComment('nonexistingpost');
      expect(store.getState().get('messages').first().get('message'), 'to equal', 'Not Found');

      const post = new Post(PostFactory.build());
      await post.save(null, { method: 'insert' });

      store = initState();
      triggers = new ActionsTrigger(client, store.dispatch);
      await triggers.createComment(post.get('id'), '');
      expect(store.getState().getIn(['ui', 'comments', 'new', 'error']), 'to equal', 'Comment text cannot be empty');
    });

    it('#deleteComment should work', async () => {
      const store = initState();
      triggers = new ActionsTrigger(client, store.dispatch);

      await triggers.deleteComment('nonexistingpostid', 'nonexistingcommentid');
      expect(store.getState().getIn(['ui', 'comments', 'nonexistingcommentid', 'error']), 'to equal', 'Not Found');
    });

    it('#saveComment should work', async () => {
      let store = initState();
      triggers = new ActionsTrigger(client, store.dispatch);

      await triggers.saveComment('nonexistingpostid', 'nonexistingcommentid', 'text');
      expect(store.getState().getIn(['ui', 'comments', 'nonexistingcommentid', 'error']), 'to equal', 'Not Found');

      const post = new Post(PostFactory.build());
      await post.save(null, { method: 'insert' });

      store = initState();
      triggers = new ActionsTrigger(client, store.dispatch);
      const comment = new Comment({
        id: uuid.v4(),
        post_id: post.get('id'),
        user_id: user.get('id'),
        text: 'test'
      });
      await comment.save(null, { method: 'insert' });

      await triggers.saveComment(post.get('id'), comment.get('id'), '');
      expect(store.getState().getIn(['ui', 'comments', comment.get('id'), 'error']), 'to equal', 'Comment text cannot be empty');
    });
  });
});
