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
import bcrypt from 'bcrypt'
import bb from 'bluebird'

import expect from '../../test-helpers/expect';
import initBookshelf from '../../src/api/db';
import { login, POST_DEFAULT_TYPE } from '../../test-helpers/api';
import QueueSingleton from '../../src/utils/queue';


let bcryptAsync = bb.promisifyAll(bcrypt);
let bookshelf = initBookshelf($dbConfig);
let Post = bookshelf.model('Post');
let User = bookshelf.model('User');
let School = bookshelf.model('School');

describe('api v.1', () => {

  describe('Authorization', () => {
    let post, user, school, unverifiedUser;

    beforeEach(async () => {
      await bookshelf.knex('users').del();
      await bookshelf.knex('posts').del();
      await bookshelf.knex('schools').del();

      user = await User.create('test', 'test', 'test@example.com');
      await user.save({'email_check_hash': ''},{require:true});

      unverifiedUser = await User.create('unverif', 'unverif', 'test-unverif@example.com');
      await unverifiedUser.save(null, {require: true});

      post = new Post({
        id: uuid4(),
        type: POST_DEFAULT_TYPE,
        user_id: user.get('id')
      });
      await post.save(null, {method: 'insert'});

      school = new School({
        id: uuid4(),
        url_name: 'test_url_name'
      });
      await school.save(null, {method: 'insert'});

    });

    afterEach(async () => {
      await post.destroy();
      await user.destroy();
      await school.destroy();
      await unverifiedUser.destroy();
    });

    describe('When user not logged it', () => {

      it('AUTHORIZED TO login and logins successfully', async () => {
        await expect(
          {
            url: `/api/v1/session`,
            method: 'POST',
            body: { username: 'test', password: 'test' }
          },
          'to body satisfy', { success: true}
        );
      });

      it('AUTHORIZED TO read post', async () => {
        await expect(`/api/v1/post/${post.id}`, 'to open authorized');
      });

      it('AUTHORIZED TO read all post', async () => {
        await expect(`/api/v1/posts/all`, 'to open authorized');
      });

      it('AUTHORIZED TO read other user posts', async () => {
        await expect(`/api/v1/posts/user/${user.id}`, 'to open authorized');
      });

      it('AUTHORIZED TO read other user liked posts', async () => {
        await expect(`/api/v1/posts/liked/${user.id}`, 'to open authorized');
      });

      it('AUTHORIZED TO read other user favoured posts', async () => {
        await expect(`/api/v1/posts/favoured/${user.id}`, 'to open authorized');
      });

      it('AUTHORIZED TO read posts by tag', async () => {
        await expect(`/api/v1/posts/tag/test`, 'to open authorized');
      });

      it('AUTHORIZED TO read posts by school', async () => {
        await expect(`/api/v1/posts/school/test`, 'to open authorized');
      });

      it('AUTHORIZED TO read schools', async () => {
        await expect(`/api/v1/schools`, 'to open authorized');
      });

      it('AUTHORIZED TO read specific school', async () => {
        await expect(`/api/v1/school/test_url_name`, 'to open authorized');
      });

      it('AUTHORIZED TO read countries', async () => {
        await expect(`/api/v1/countries`, 'to open authorized');
      });

      it('AUTHORIZED TO read specific country', async () => {
        await expect(`/api/v1/country/test`, 'to open authorized');
      });

      it('AUTHORIZED TO read specific country posts', async () => {
        await expect(`/api/v1/country/test/posts`, 'to open authorized');
      });

      it('AUTHORIZED TO read specific city', async () => {
        await expect(`/api/v1/city/test`, 'to open authorized');
      });

      it('AUTHORIZED TO read specific city posts', async () => {
        await expect(`/api/v1/city/test/posts`, 'to open authorized');
      });

      it('AUTHORIZED TO read specific user', async () => {
        await expect(`/api/v1/user/test`, 'to open authorized');
      });

      it('AUTHORIZED TO read specific user', async () => {
        await expect(`/api/v1/user/test`, 'to open authorized');
      });

      it('AUTHORIZED TO verify email', async () => {
        await expect({ url: `/api/v1/user/verify/${unverifiedUser.get('email_check_hash')}` }, 'to open authorized');
      });

      it('AUTHORIZED TO change anonymous change password feature', async () => {
        await expect({ url: `/api/v1/newpassword/test` }, 'to open authorized');
      });

      it('AUTHORIZED TO use anonymous reset password feature', async () => {
        await expect({ url: `/api/v1/resetpassword` }, 'to open authorized');
      });

      it('NOT AUTHORIZED TO open liked posts page', async () => {
        await expect({ url: '/api/v1/posts/liked' }, 'not to open authorized');
      });

      it('NOT AUTHORIZED TO open favoured posts page', async () => {
        await expect({ url: '/api/v1/posts/favoured' }, 'not to open authorized');
      });

      it('NOT AUTHORIZED TO create post', async () => {
        await expect({ url: '/api/v1/posts', method: 'POST' }, 'not to open authorized');
      });

      it('NOT AUTHORIZED TO update post', async () => {
        await expect({ url: `/api/v1/post/${post.id}`, method: 'POST' }, 'not to open authorized');
      });

      it('NOT AUTHORIZED TO delete post', async () => {
        await expect({ url: `/api/v1/post/${post.id}`, method: 'DELETE' }, 'not to open authorized');
      });

      it('NOT AUTHORIZED TO like post', async () => {
        await expect({ url: `/api/v1/post/${post.id}/like`, method: 'POST' }, 'not to open authorized');
      });

      it('NOT AUTHORIZED TO unlike post', async () => {
        await expect({ url: `/api/v1/post/${post.id}/unlike`, method: 'POST' }, 'not to open authorized');
      });

      it('NOT AUTHORIZED TO fav post', async () => {
        await expect({ url: `/api/v1/post/${post.id}/fav`, method: 'POST' }, 'not to open authorized');
      });

      it('NOT AUTHORIZED TO unfav post', async () => {
        await expect({ url: `/api/v1/post/${post.id}/unfav`, method: 'POST' }, 'not to open authorized');
      });

      it('NOT AUTHORIZED TO read tags', async () => {
        await expect({ url: `/api/v1/user/tags` }, 'not to open authorized');
      });

      it('NOT AUTHORIZED TO update school', async () => {
        await expect({ url: `/api/v1/school/${school.id}`, method: 'POST' }, 'not to open authorized');
      });

      it('NOT AUTHORIZED TO follow school', async () => {
        await expect({ url: `/api/v1/school/${school.get('url_name')}/follow`, method: 'POST' }, 'not to open authorized');
      });

      it('NOT AUTHORIZED TO unfollow school', async () => {
        await expect({ url: `/api/v1/school/${school.get('url_name')}/unfollow`, method: 'POST' }, 'not to open authorized');
      });

      it('NOT AUTHORIZED TO follow user', async () => {
        await expect({ url: `/api/v1/user/${user.get('id')}/follow`, method: 'POST' }, 'not to open authorized');
      });

      it('NOT AUTHORIZED TO unfollow user', async () => {
        await expect({ url: `/api/v1/user/${user.get('id')}/unfollow`, method: 'POST' }, 'not to open authorized');
      });

      it('NOT AUTHORIZED TO update user', async () => {
        await expect({ url: `/api/v1/user`, method: 'POST' }, 'not to open authorized');
      });

      it('NOT AUTHORIZED TO change password', async () => {
        await expect({ url: `/api/v1/user/password`, method: 'POST' }, 'not to open authorized');
      });

      it('NOT AUTHORIZED TO suggestions', async () => {
        await expect({ url: `/api/v1/suggestions/personalized` }, 'not to open authorized');
      });

      it('NOT AUTHORIZED TO initial suggestions', async () => {
        await expect({ url: `/api/v1/suggestions/initial` }, 'not to open authorized');
      });

      it('NOT AUTHORIZED TO upload files', async () => {
        await expect({ url: `/api/v1/upload`, method: 'POST' }, 'not to open authorized');
      });

      it('NOT AUTHORIZED TO process image', async () => {
        await expect({ url: `/api/v1/image`, method: 'POST' }, 'not to open authorized');
      });

      it('NOT AUTHORIZED TO pickpoint', async () => {
        await expect({ url: `/api/v1/pickpoint` }, 'not to open authorized');
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

      it('AUTHORIZED TO update own post', async () => {
        await expect({ url: `/api/v1/post/${post.id}`, session: sessionId, method: 'POST' }, 'to open authorized');
      });

      it('AUTHORIZED TO create post', async () => {
        await expect({ url: `/api/v1/posts`, session: sessionId, method: 'POST' }, 'to open authorized');
      });

      it('AUTHORIZED TO delete own post', async () => {
        await expect({ url: `/api/v1/post/${post.id}`, session: sessionId, method: 'DELETE' }, 'to open authorized');
      });

      it('AUTHORIZED TO like other post', async () => {
        await expect({ url: `/api/v1/post/${otherPost.id}/like`, session: sessionId, method: 'POST' }, 'to open authorized');
      });

      it('AUTHORIZED TO unlike other post', async () => {
        await expect({ url: `/api/v1/post/${otherPost.id}/unlike`, session: sessionId, method: 'POST' }, 'to open authorized');
      });

      it('AUTHORIZED TO fav other post', async () => {
        await expect({ url: `/api/v1/post/${otherPost.id}/fav`, session: sessionId, method: 'POST' }, 'to open authorized');
      });

      it('AUTHORIZED TO unfav other post', async () => {
        await expect({ url: `/api/v1/post/${otherPost.id}/unfav`, session: sessionId, method: 'POST' }, 'to open authorized');
      });

      it('AUTHORIZED TO read own liked posts', async () => {
        await expect({ url: `/api/v1/posts/liked`, session: sessionId }, 'to open authorized');
      });

      it('AUTHORIZED TO read own favoured posts', async () => {
        await expect({ url: `/api/v1/posts/favoured`, session: sessionId }, 'to open authorized');
      });

      it('AUTHORIZED TO follow school', async () => {
        await expect({ url: `/api/v1/school/${school.get('url_name')}/follow`, session: sessionId, method: 'POST' }, 'to open authorized');
      });

      it('AUTHORIZED TO follow user', async () => {
        await expect({ url: `/api/v1/user/${unverifiedUser.get('username')}/follow`, session: sessionId, method: 'POST' }, 'to open authorized');
      });

      it('AUTHORIZED TO unfollow user', async () => {
        await expect({ url: `/api/v1/user/${unverifiedUser.get('username')}/unfollow`, session: sessionId, method: 'POST' }, 'to open authorized');
      });

      it('AUTHORIZED TO unfollow school', async () => {
        await expect({ url: `/api/v1/school/${school.get('url_name')}/unfollow`, session: sessionId, method: 'POST' }, 'to open authorized');
      });

      it('AUTHORIZED TO update his own user record', async () => {
        await expect({ url: `/api/v1/user`, session: sessionId, method: 'POST' }, 'to open authorized');
      });

      it('AUTHORIZED TO update his password', async () => {
        await expect({ url: `/api/v1/user/password`, session: sessionId, method: 'POST' }, 'to open authorized');
      });

      it('AUTHORIZED TO delete other post', async () => {
        await expect({ url: `/api/v1/post/${otherPost.id}`, session: sessionId, method: 'DELETE' }, 'to open authorized');
      });

      it('AUTHORIZED TO logout', async () => {
        await expect({ url: `/api/v1/logout`, session: sessionId }, 'to open authorized');
      });

      it('AUTHORIZED TO suggestions', async () => {
        await expect({ url: `/api/v1/suggestions/personalized`, session: sessionId }, 'to open authorized');
      });

      it('AUTHORIZED TO initial suggestions', async () => {
        await expect({ url: `/api/v1/suggestions/initial`, session: sessionId }, 'to open authorized');
      });

      it('AUTHORIZED TO upload files', async () => {
        await expect({ url: `/api/v1/upload`, method: 'POST', session: sessionId }, 'to open authorized');
      });

      it('AUTHORIZED TO process image', async () => {
        await expect({ url: `/api/v1/image`, method: 'POST', session: sessionId }, 'to open authorized');
      });

      // TODO: in controller http request to pickopint must be isolated in a component
      // it('AUTHORIZED TO pickpoint', async () => {
      //   await expect({ url: `/api/v1/pickpoint`, session: sessionId }, 'to open authorized');
      // });

      it('NOT AUTHORIZED TO use anonymous reset password feature', async () => {
        await expect({ url: `/api/v1/resetpassword`, session: sessionId, method: 'POST' }, 'not to open authorized');
      });

    });

  });

  describe('Validation', () => {

    describe('Registration Rules', () => {

      it('FAILS for some base rules', async () => {
        await expect({ url: `/api/v1/users`, method: 'POST', body: {
          username: 'Abcdefghijklmnopqrstuvwxyz_abcdefghijklmnopqrstuvwxyz', // 49
          password: "test",
          email: 'test'
        }}, 'to validation fail with', {
          username: ['The username must not exceed 31 characters long',
                     'Username can contain letters a-z, numbers 0-9, dashes (-), underscores (_), apostrophes (\'), and periods (.)'
                    ],
          password: ['Password is min. 8 characters. Password can only have ascii characters.'],
          email: [ 'The email must be a valid email address' ]
        });
      });

      it('FAILS when password contain special(non visible ascii) characters', async () => {
        await expect({ url: `/api/v1/users`, method: 'POST', body: {
          username: 'Abcdefghijklmnopqrstuvwxyz_abcdefghijklmnopqrstuvwxyz', // 49
          password: "testtest\x00",
          email: 'test'
        }}, 'to validation fail with', {
          username: ['The username must not exceed 31 characters long',
                     'Username can contain letters a-z, numbers 0-9, dashes (-), underscores (_), apostrophes (\'), and periods (.)'
                    ],
          password: ['Password is min. 8 characters. Password can only have ascii characters.'],
          email: [ 'The email must be a valid email address' ]
        });
      });

      it('FAILS when no required attributes passed', async () => {
        await expect({ url: `/api/v1/users`, method: 'POST', body: {
        }}, 'to validation fail with', {
          username: ['The username is required'],
          password: ['The password is required'],
          email: ['The email is required']
        });
      });

      describe ('Email validation', async () => {
        let validEmails = [
          'test@domain.com',
          'firstname.lastname@domain.com',
          'email@subdomain.domain.com',
          'firstname+lastname@domain.com',
          'email@123.123.123.123',
          '""email""@domain.com',
          '1234567890@domain.com',
          'email@domain-one.co',
          '_______@domain.com',
          'email@domain.nam',
          'email@domain.co.jp',
          'firstname-lastname@domain.com'
        ];

        let invalidEmails = [
          'plainaddress',
          '#@%^%@$@#$@#.com',
          '@domain.com',
          'Joe Smith <email@domain.com>',
          'email.domain.com',
          'email@domain@domain.com',
          '.email@domain.com',
          'email.@domain.com',
          'email..email@domain.com',
          'あいうえお@domain.com',
          'email@domain.com (Joe Smith)',
          'email@domain',
          'email@-domain.com',
          // 'email@domain.web',
          // 'email@111.222.333.44444',
          'email@domain..com'
        ];

        validEmails.map((email) => {
          it(`PASS email validation with email: ${email}`, async function() {
            // prove that there is no email validation errors
            await expect({ url: `/api/v1/users`, method: 'POST', body: {
              email: email
            }}, 'to validation fail with', {
              username: ['The username is required'],
              password: ['The password is required']
            });
          });
        });

        invalidEmails.map((email) => {
          it(`FAIL email validation with email: ${email}`, async function() {
            // prove that there is no email validation errors
            await expect({ url: `/api/v1/users`, method: 'POST', body: {
              email: email
            }}, 'to validation fail with', {
              username: ['The username is required'],
              password: ['The password is required'],
              email: ['The email must be a valid email address']
            });
          });
        });
      });
    });
  });

  describe('Functional', () => {
    let user, queue, resetPasswordUser;

    before(() => {
      queue = new QueueSingleton().handler;
      queue.testMode.enter();
    });

    after(() => {
      queue.testMode.exit();
    });

    beforeEach(async () => {
      await bookshelf.knex('users').del();
      user = await User.create('test2', 'testPassword', 'test2@example.com');
      await user.save({'email_check_hash': ''},{require:true});

      resetPasswordUser = await User.create('reset', 'testPassword', 'reset@example.com');
      await resetPasswordUser.save({email_check_hash: '', reset_password_hash: 'foo'},{require:true});
    });

    afterEach(async () => {
      await user.destroy();
      await resetPasswordUser.destroy();
      queue.testMode.clear();
    });

    it('Create new queue job after user registration', async () => {
      await expect({ url: `/api/v1/users`, method: 'POST', body: {
        username: 'test',
        password: 'testPass',
        email: 'test@example.com'
      }}, 'to open successfully');

      expect(queue.testMode.jobs.length,'to equal', 1);
      expect(queue.testMode.jobs[0].type, 'to equal', 'register-user-email');
      expect(queue.testMode.jobs[0].data, 'to satisfy', { username: 'test', email: 'test@example.com' });
    });

    it('Create new queue job after user request reset password', async () => {
      await expect({ url: `/api/v1/resetpassword`, method: 'POST', body: {
        email: 'test2@example.com'
      }}, 'to open successfully');

      expect(queue.testMode.jobs.length,'to equal', 1);
      expect(queue.testMode.jobs[0].type, 'to equal', 'reset-password-email');
      expect(queue.testMode.jobs[0].data, 'to satisfy', { username: 'test2', email: 'test2@example.com' });
    });

    it('New password works', async () => {
      await expect({ url: `/api/v1/newpassword/foo`, method: 'POST', body: {
        password: 'foo',
        password_repeat: 'foo'
      }}, 'to open successfully');

      let localUser = await User.where({id: resetPasswordUser.id}).fetch({require: true});
      const passwordValid = await bcryptAsync.compareAsync('foo', await localUser.get('hashed_password'));

      expect(passwordValid, 'to be true');
      expect(localUser.get('reset_password_hash'), 'to be empty');
    });

  });

});
