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
import fs from 'fs';

import { v4 as uuid4 } from 'uuid';
import bcrypt from 'bcrypt';
import bb from 'bluebird';
import FormData from 'form-data';
import AWS from 'mock-aws';
import { reverse } from 'lodash';

import enLocalization from '../../res/locale/en';

import expect from '../../test-helpers/expect';
import initBookshelf from '../../src/api/db';
import { login, POST_DEFAULT_TYPE } from '../../test-helpers/api';
import QueueSingleton from '../../src/utils/queue';
import HashtagFactory from '../../test-helpers/factories/hashtag';
import PostFactory from '../../test-helpers/factories/post';


const bcryptAsync = bb.promisifyAll(bcrypt);
const bookshelf = initBookshelf($dbConfig);
const Post = bookshelf.model('Post');
const User = bookshelf.model('User');
const Hashtag = bookshelf.model('Hashtag');
const Geotag = bookshelf.model('Geotag');
const Attachment = bookshelf.model('Attachment');

const range = (start, end) => [...Array(end - start + 1)].map((_, i) => start + i);

describe('api v.1', () => {
  describe('Validation', () => {
    describe('Registration Rules', () => {
      it('FAILS for some base rules', async () => {
        await expect({ url: `/api/v1/users`, method: 'POST', body: {
          username: '#abcdefghijklmnopqrstuvwxyz_abcdefghijklmnopqrstuvwxyz', // 49
          password: "test",
          email: 'test'
        } }, 'to fail validation with', {
          username: ['The username must not exceed 31 characters long',
            'Username can contain letters a-z, numbers 0-9, dashes (-), underscores (_), apostrophes (\'), and periods (.)'
          ],
          password: ['Password is min. 8 characters. Password can only have ascii characters.'],
          email: ['The email must be a valid email address']
        });
      });

      it('FAILS when password contain special(non visible ascii) characters', async () => {
        await expect({ url: `/api/v1/users`, method: 'POST', body: {
          username: 'user',
          password: "testtest\x00",
          email: 'test@example.com'
        } }, 'to fail validation with', {
          password: ['Password is min. 8 characters. Password can only have ascii characters.']
        });
      });

      it('FAILS when no required attributes passed', async () => {
        await expect({ url: `/api/v1/users`, method: 'POST', body: {
        } }, 'to fail validation with', {
          username: ['The username is required'],
          password: ['The password is required'],
          email: ['The email is required']
        });
      });

      describe('Email validation', async () => {
        const validEmails = [
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

        const invalidEmails = [
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
          it(`PASS email validation with email: ${email}`, async function () {
            // prove that there is no email validation errors
            await expect({ url: `/api/v1/users`, method: 'POST', body: {
              email
            } }, 'to fail validation with', {
              username: ['The username is required'],
              password: ['The password is required']
            });
          });
        });

        invalidEmails.map((email) => {
          it(`FAIL email validation with email: ${email}`, async function () {
            // prove that there is no email validation errors
            await expect({ url: `/api/v1/users`, method: 'POST', body: {
              email
            } }, 'to fail validation with', {
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
    describe('Kue', () => {
      let queue;

      before(() => {
        queue = new QueueSingleton().handler;
        queue.testMode.enter();
      });

      after(() => {
        queue.testMode.exit();
      });

      describe('when user does not exist', () => {
        beforeEach(async () => {
          await bookshelf.knex('users').del();
        });

        afterEach(async () => {
          await bookshelf.knex('users').del();
          queue.testMode.clear();
        });

        it('Create new queue job after user registration', async () => {
          await expect({ url: `/api/v1/users`, method: 'POST', body: {
            username: 'test',
            password: 'testPass',
            email: 'test@example.com'
          } }, 'to open successfully');

          expect(queue.testMode.jobs.length, 'to equal', 1);
          expect(queue.testMode.jobs[0].type, 'to equal', 'register-user-email');
          expect(queue.testMode.jobs[0].data, 'to satisfy', { username: 'test', email: 'test@example.com' });
        });
      });

      describe('when user exists', () => {
        let user;

        beforeEach(async () => {
          await bookshelf.knex('users').del();

          user = await User.create('test2', 'testPassword', 'test2@example.com');
          await user.save({ 'email_check_hash': '' }, { require: true });
        });

        afterEach(async () => {
          await user.destroy();
          queue.testMode.clear();
        });

        it('Create new queue job after user request reset password', async () => {
          await expect({ url: `/api/v1/resetpassword`, method: 'POST', body: {
            email: 'test2@example.com'
          } }, 'to open successfully');

          expect(queue.testMode.jobs.length, 'to equal', 1);
          expect(queue.testMode.jobs[0].type, 'to equal', 'reset-password-email');
          expect(queue.testMode.jobs[0].data, 'to satisfy', { username: 'test2', email: 'test2@example.com' });
        });
      });
    });

    describe('Authenticated user', () => {
      let user,
        sessionId;

      before(async () => {
        await bookshelf.knex('users').del();
        await bookshelf.knex('attachments').del();
        user = await User.create('mary', 'secret', 'mary@example.com');
        await user.save({ email_check_hash: '' }, { require: true });

        sessionId = await login('mary', 'secret');
      });

      after(async () => {
        await user.destroy();
      });

      describe('User settings', () => {
        it('bio update works', async () => {
          await expect(
            { url: `/api/v1/user`, session: sessionId, method: 'POST', body: { more: { bio: 'foo' } } }
            , 'to open successfully');

          const localUser = await User.where({ id: user.id }).fetch({ require: true });

          expect(localUser.get('more').bio, 'to equal', 'foo');
        });
      });

      describe('Upload files', () => {
        before(() => {
          // mocking S3
          AWS.mock('S3', 'upload', () => {
            return {
              promise() {
                return { Location: 's3-mocked-location' };
              }
            };
          });
        });

        after(() => {
          AWS.restore('S3');
        });

        it('validation works', async () => {
          await expect(
            { url: `/api/v1/upload`, session: sessionId, method: 'POST' }
            , 'to fail validation with', '"files" parameter is not provided');
        });

        it('works', async () => {
          const formData = new FormData;
          formData.append('files', fs.createReadStream('./test-helpers/bulb.png'));

          await expect(
            {
              url: `/api/v1/upload`,
              session: sessionId,
              method: 'POST',
              headers: formData.getHeaders(),
              body: formData
            },
            'to open successfully'
          );
          const attachment = await Attachment.where({ filename: 'bulb.png' }).count();

          expect(attachment, 'to equal', '1');
        });
      });

      describe('Change password', () => {
        it('/user/password should work', async () => {
          await expect(
            {
              url: `/api/v1/user/password`,
              session: sessionId,
              method: 'POST',
              body: { old_password: 'secret', new_password: 'barsecret' }
            }
            , 'to open successfully');
          await user.refresh();
          expect(
            await bcryptAsync.compareAsync('barsecret', user.get('hashed_password')),
            'to be true'
          );
        });
      });

      describe('Posts', () => {
        let post;

        beforeEach(async () => {
          await bookshelf.knex('posts').del();

          post = new Post({
            id: uuid4(),
            type: POST_DEFAULT_TYPE,
            text: `This is clean post`
          });
          await post.save({}, { method: 'insert' });
        });

        afterEach(async () => {
          await post.destroy();
        });

        describe('Subscriptions', () => {
          let posts;

          beforeEach(async () => {
            await bookshelf.knex('posts').del();

            posts = await Promise.all(range(1, 10).map(i => {
              const post = new Post({
                id: uuid4(),
                type: POST_DEFAULT_TYPE,
                user_id: user.get('id'),
                text: `This is a Post #${i}`
              });

              const dateJson = new Date(Date.now() - 50000 + i * 1000).toJSON();
              const defaultAttr = { updated_at: dateJson };

              return post.save(defaultAttr, { method: 'insert' });
            }));
          });

          afterEach(async () => {
            await Promise.all(posts.map(post => post.destroy()));
          });

          it('First page of subscriptions should return by-default', async () => {
            await expect(
              { url: `/api/v1/posts`, session: sessionId },
              'body to satisfy', reverse(posts.slice(5).map(post => ({ id: post.id })))
            );
          });

          it('Other pages of subscriptions should work', async () => {
            await expect(
              { url: `/api/v1/posts?offset=4`, session: sessionId },
              'body to satisfy', reverse(posts.slice(1, 6).map(post => ({ id: post.id })))
            );
          });
        });

        describe('Favourites', () => {
          let ownPost;

          beforeEach(async () => {
            ownPost = new Post({
              id: uuid4(),
              type: POST_DEFAULT_TYPE,
              text: `This is own post`,
              user_id: user.id
            });
            await ownPost.save({}, { method: 'insert' });
          });

          afterEach(async () => {
            await ownPost.destroy();
          });

          it('CAN fav post', async () => {
            await expect(
              { url: `/api/v1/post/${post.id}/fav`, session: sessionId, method: 'POST' },
              'to open successfully'
            );
            const localUser = await User.where({ id: user.id }).fetch({ require: true, withRelated: ['favourited_posts'] });

            expect(localUser.related('favourited_posts').length, 'to equal', 1);
            expect(localUser.related('favourited_posts').models[0].get('text'), 'to equal', 'This is clean post');
          });

          it('CAN unfav post', async () => {
            await user.favourited_posts().attach(post);
            await expect(
              { url: `/api/v1/post/${post.id}/unfav`, session: sessionId, method: 'POST' },
              'to open successfully'
            );
            const localUser = await User.where({ id: user.id }).fetch({ require: true, withRelated: ['favourited_posts'] });

            expect(localUser.related('favourited_posts').models, 'to be empty');
          });

          it('Favoured list should work', async () => {
            await user.favourited_posts().attach(post);
            await expect(
              { url: `/api/v1/posts/favoured`, session: sessionId },
              'body to satisfy', [{ id: post.id }]
            );
          });

          it('CAN NOT fav own post', async () => {
            await expect(
              { url: `/api/v1/post/${ownPost.id}/fav`, session: sessionId, method: 'POST' },
              'not to open authorized'
            );
          });
        });

        describe('Likes', () => {
          let ownPost;

          beforeEach(async () => {
            ownPost = new Post({
              id: uuid4(),
              type: POST_DEFAULT_TYPE,
              text: `This is own post`,
              user_id: user.id
            });
            await ownPost.save({}, { method: 'insert' });
          });

          afterEach(async () => {
            await user.liked_posts().detach(post);
            await ownPost.destroy();
          });

          it('CAN like post', async () => {
            await expect(
              { url: `/api/v1/post/${post.id}/like`, session: sessionId, method: 'POST' },
              'to open successfully'
            );
            const localUser = await User.where({ id: user.id }).fetch({ require: true, withRelated: ['liked_posts'] });

            expect(localUser.related('liked_posts').length, 'to equal', 1);
            expect(localUser.related('liked_posts').models[0].get('text'), 'to equal', 'This is clean post');
          });

          it('CAN unlike post', async () => {
            await user.liked_posts().attach(post);
            await expect(
              { url: `/api/v1/post/${post.id}/unlike`, session: sessionId, method: 'POST' },
              'to open successfully'
            );
            const localUser = await User.where({ id: user.id }).fetch({ require: true, withRelated: ['liked_posts'] });

            expect(localUser.related('liked_posts').models, 'to be empty');
          });

          it('Liked list should work', async () => {
            await user.liked_posts().attach(post);
            await expect(
              { url: `/api/v1/posts/liked`, session: sessionId },
              'body to satisfy', [{ id: post.id }]
            );
          });

          it('CAN NOT like own post', async () => {
            await expect(
              { url: `/api/v1/post/${ownPost.id}/fav`, session: sessionId, method: 'POST' },
              'not to open authorized'
            );
          });

          describe('likers list', () => {
            const users = [];
            const userSessions = [];

            beforeEach(async () => {
              for (let i = 0; i < 2; ++i) {
                users[i] = await User.create(`likes_test${i}`, 'testPassword', `likes_test${i}@example.com`);
                await users[i].save({ email_check_hash: '' }, { require: true });

                userSessions[i] = await login(`likes_test${i}`, 'testPassword');

                await expect(
                  { url: `/api/v1/post/${post.id}/like`, session: userSessions[i], method: 'POST' },
                  'to open successfully'
                );
              }
            });

            afterEach(async () => {
              for (let i = 0; i < 2; ++i) {
                await expect(
                  { url: `/api/v1/post/${post.id}/unlike`, session: userSessions[i], method: 'POST' },
                  'to open successfully'
                );

                await users[i].destroy();
              }
            });

            it('non-author MUST see only his like', async () => {
              await expect(
                { url: `/api/v1/post/${post.id}`, session: sessionId, method: 'GET' },
                'body to satisfy',
                { likers: [] }
              );

              await expect(
                { url: `/api/v1/post/${post.id}/like`, session: sessionId, method: 'POST' },
                'to open successfully'
              );

              let localUser = await User.where({ id: user.id }).fetch({ require: true, withRelated: ['liked_posts'] });
              localUser = await localUser.toJSON();

              await expect(
                { url: `/api/v1/post/${post.id}`, session: sessionId, method: 'GET' },
                'body to satisfy',
                { likers: [{ id: localUser.id }] }
              );

              await expect(
                { url: `/api/v1/post/${post.id}/unlike`, session: sessionId, method: 'POST' },
                'to open successfully'
              );
            });
          });
        });

        describe('Comments', () => {
          it('CAN comment on post', async () => {
            await expect(
              { url: `/api/v1/post/${post.id}/comments`, session: sessionId, method: 'POST', body: { text: 'This is a test comment' } },
              'to open successfully'
            );
          });
        });
      });

      describe('Hashtags', () => {
        let tag;

        beforeEach(async () => {
          await bookshelf.knex('hashtags').del();
          await user.refresh({ require: true, withRelated: ['liked_hashtags', 'followed_hashtags'] });

          tag = new Hashtag({
            id: uuid4(),
            name: 'footag'
          });
          await tag.save({}, { method: 'insert' });
        });

        afterEach(async () => {
          await tag.destroy();
        });

        it("sends an array of tags, where each tag used in multiple posts appears only once", async () => {
          const hashtag = await new Hashtag(HashtagFactory.build()).save(null, { method: 'insert' });

          const post1 = await new Post(PostFactory.build({ user_id: user.id })).save(null, { method: 'insert' });
          await post1.hashtags().attach(hashtag);
          const post2 = await new Post(PostFactory.build({ user_id: user.id })).save(null, { method: 'insert' });
          await post2.hashtags().attach(hashtag);

          await expect(
            { url: `/api/v1/user/tags`, session: sessionId },
            'body to satisfy',
            body => {
              expect(body.hashtags, 'to have length', 1);
            }
          );
        });

        it('CAN like hashtag', async () => {
          expect(user.related('liked_hashtags').length, 'to equal', 0);

          await expect(
            { url: `/api/v1/tag/${tag.get('name')}/like`, session: sessionId, method: 'POST' },
            'to open successfully'
          );
          await user.refresh({ require: true, withRelated: ['liked_hashtags'] });

          expect(user.related('liked_hashtags').length, 'to equal', 1);
          expect(user.related('liked_hashtags').models[0].get('name'), 'to equal', 'footag');
        });

        it('CAN unlike hashtag', async () => {
          await user.related('liked_hashtags').attach(tag);
          expect(user.related('liked_hashtags').length, 'to equal', 1);

          await expect(
            { url: `/api/v1/tag/${tag.get('name')}/unlike`, session: sessionId, method: 'POST' },
            'to open successfully'
          );
          await user.refresh({ require: true, withRelated: ['liked_hashtags'] });

          expect(user.related('liked_hashtags').models, 'to be empty');
        });

        it('CAN follow hashtag', async () => {
          expect(user.related('followed_hashtags').length, 'to equal', 0);

          await expect(
            { url: `/api/v1/tag/${tag.get('name')}/follow`, session: sessionId, method: 'POST' },
            'to open successfully'
          );

          await user.refresh({ withRelated: ['followed_hashtags'] });
          expect(user.related('followed_hashtags').length, 'to equal', 1);
          expect(user.related('followed_hashtags').models[0].get('name'), 'to equal', 'footag');
        });

        it('CAN unfollow hashtag', async () => {
          await user.related('followed_hashtags').attach(tag);
          expect(user.related('followed_hashtags').length, 'to equal', 1);

          await expect(
            { url: `/api/v1/tag/${tag.get('name')}/unfollow`, session: sessionId, method: 'POST' },
            'to open successfully'
          );

          await user.refresh({ withRelated: ['followed_hashtags'] });
          expect(user.related('followed_hashtags').length, 'to equal', 0);
        });
      });

      describe('Geotags', () => {
        let geotag;

        beforeEach(async () => {
          await user.refresh({ require: true, withRelated: ['liked_geotags', 'followed_geotags'] });
          await bookshelf.knex('geotags').del();

          geotag = new Geotag({
            id: uuid4(),
            url_name: 'foo_geotag'
          });
          await geotag.save({}, { method: 'insert' });
        });

        afterEach(async () => {
          await geotag.destroy();
        });

        it('CAN like geotag', async () => {
          expect(user.related('liked_geotags').length, 'to equal', 0);

          await expect(
            { url: `/api/v1/geotag/${geotag.get('url_name')}/like`, session: sessionId, method: 'POST' },
            'to open successfully'
          );
          await user.refresh({ require: true, withRelated: ['liked_geotags'] });

          expect(user.related('liked_geotags').length, 'to equal', 1);
        });

        it('CAN unlike geotag', async () => {
          expect(user.related('liked_geotags').length, 'to equal', 0);
          await user.related('liked_geotags').attach(geotag);
          expect(user.related('liked_geotags').length, 'to equal', 1);

          await expect(
            { url: `/api/v1/geotag/${geotag.get('url_name')}/unlike`, session: sessionId, method: 'POST' },
            'to open successfully'
          );
          await user.refresh({ require: true, withRelated: ['liked_geotags'] });

          expect(user.related('liked_geotags').models, 'to be empty');
        });

        it('CAN follow geotag', async () => {
          expect(user.related('followed_hashtags').length, 'to equal', 0);

          await expect(
            { url: `/api/v1/geotag/${geotag.get('url_name')}/follow`, session: sessionId, method: 'POST' },
            'to open successfully'
          );

          await user.refresh({ withRelated: ['followed_geotags'] });
          expect(user.related('followed_geotags').length, 'to equal', 1);
        });

        it('CAN unfollow geotag', async () => {
          await user.related('followed_geotags').attach(geotag);
          expect(user.related('followed_geotags').length, 'to equal', 1);

          await expect(
            { url: `/api/v1/geotag/${geotag.get('url_name')}/unfollow`, session: sessionId, method: 'POST' },
            'to open successfully'
          );

          await user.refresh({ withRelated: ['followed_geotags'] });
          expect(user.related('followed_geotags').length, 'to equal', 0);
        });
      });
    });


    describe('Not authenticated user', () => {
      describe('Change password', () => {
        let resetPasswordUser;

        before(async () => {
          await bookshelf.knex('users').del();

          resetPasswordUser = await User.create('reset', 'testPassword', 'reset@example.com');
          await resetPasswordUser.save({ email_check_hash: '', reset_password_hash: 'foo' }, { require: true });
        });

        after(async () => {
          await resetPasswordUser.destroy();
        });

        it('New password works', async () => {
          await expect({ url: `/api/v1/newpassword/foo`, method: 'POST', body: {
            password: 'foo',
            password_repeat: 'foo'
          } }, 'to open successfully');

          const localUser = await User.where({ id: resetPasswordUser.id }).fetch({ require: true });
          const passwordValid = await bcryptAsync.compareAsync('foo', await localUser.get('hashed_password'));

          expect(passwordValid, 'to be true');
          expect(localUser.get('reset_password_hash'), 'to be empty');
        });
      });

      describe('Posts', () => {
        let post;
        beforeEach(async () => {
          await bookshelf.knex('posts').del();

          post = new Post({
            id: uuid4(),
            type: POST_DEFAULT_TYPE,
            text: `This is a test Post`
          });
          await post.save({}, { method: 'insert' });
        });

        afterEach(async () => {
          await post.destroy();
        });

        it('Tag page should work', async () => {
          await post.attachHashtags(['foo']);
          await expect(
            { url: `/api/v1/posts/tag/foo` },
            'body to satisfy', [{ id: post.id }]
          );
          await post.detachHashtags(['foo']);
        });

        describe('Favorites', () => {
          let user;

          beforeEach(async () => {
            await bookshelf.knex('users').del();
            user = await User.create('mary', 'secret', 'mary@example.com');
          });

          afterEach(async () => {
            await user.destroy();
          });

          it('Favoured posts for user should work', async () => {
            await user.favourited_posts().attach(post);
            await expect(
              { url: `/api/v1/posts/favoured/${user.get('username')}` },
              'body to satisfy', [{ id: post.id }]
            );
          });

          it('/api/v1/posts/favoured for non existing user should expose json with empty array', async () => {
            await expect(
              { url: `/api/v1/posts/favoured/nonexistinguser` },
              'body to satisfy',
              []
            );
          });
        });

        describe('Likes', () => {
          let user;

          beforeEach(async () => {
            await bookshelf.knex('users').del();
            user = await User.create('mary', 'secret', 'mary@example.com');
          });

          afterEach(async () => {
            await user.destroy();
          });

          it('Liked posts for user should work', async () => {
            await user.liked_posts().attach(post);
            await expect(
              { url: `/api/v1/posts/liked/${user.get('username')}` },
              'body to satisfy', [{ id: post.id }]
            );
          });

          it('/api/v1/posts/liked for non existing user should expose json with empty array', async () => {
            await expect(
              { url: `/api/v1/posts/liked/nonexistinguser` },
              'body to satisfy',
              []
            );
          });

          it('Anonymous user MUST NOT see post\'s likers list', async () => {
            await user.save({ email_check_hash: '' }, { require: true });
            const session = await login('mary', 'secret');

            await expect(
              { url: `/api/v1/post/${post.get('id')}/like`, session, method: 'POST' },
              'to open successfully'
            );

            // Mary actually liked the post
            await expect(
              { url: `/api/v1/post/${post.get('id')}`, session, method: 'GET' },
              'body to satisfy',
              { likers: [{ id: user.get('id') }] }
            );

            await expect(
              { url: `/api/v1/post/${post.get('id')}`, method: 'GET' },
              'body to satisfy',
              { likers: [] }
            );

            await expect(
              { url: `/api/v1/post/${post.get('id')}/unlike`, session, method: 'POST' },
              'to open successfully'
            );
          });
        });

        describe('Geotags', () => {
          it('Non existing geotag page should answer "Not found"', async () => {
            await expect(
              { url: `/api/v1/posts/geotag/non-existing-geotag` },
              'to open not found'
            );
          });
        });
      });

      describe('Localization', () => {
        describe('When locale\'s code is not present', () => {
          it('returns "Not found" error', () => (
            expect(
              { url: '/api/v1/locale' },
              'to open not found'
            )
          ));
        });

        describe('When locale isn\'t supported', () => {
          it('returns "Not found" error with ...', async () => {
            const ctx = await expect(
              { url: '/api/v1/locale/xyz' },
              'to open not found'
            );
            expect(
              ctx.httpResponse.body,
              'to equal',
              { error: 'Locale isn\'t supported' }
            );
          });
        });

        describe('When locale is supported', () => {
          it('returns a valid dictionary with phrases', () => (
            expect(
              { url: '/api/v1/locale/en' },
              'body to satisfy',
              enLocalization
            )
          ));
        });
      });
    });
  });
});
