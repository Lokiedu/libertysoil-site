/*
 This file is a part of libertysoil.org website
 Copyright (C) 2016  Loki Education (Social Enterprise)

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
import expect from '../../../test-helpers/expect';
import initBookshelf from '../../../src/api/db';

import UserFactory from '../../../test-helpers/factories/user';
import HashtagFactory from '../../../test-helpers/factories/hashtag';
import PostFactory from '../../../test-helpers/factories/post';
import { login } from '../../../test-helpers/api';

const bookshelf = initBookshelf($dbConfig);
const User = bookshelf.model('User');
const Post = bookshelf.model('Post');
const Hashtag = bookshelf.model('Hashtag');

describe('Bookmarks', () => {
  describe('GET /api/v1/url', () => {
    describe('Not authenticated users', () => {
      const requestDefault = {
        url: '/api/v1/url',
        method: 'GET'
      };

      it('fails', () => {
        return expect(
          requestDefault,
          'body to satisfy',
          { error: 'You are not authorized' }
        );

        /* Haven't been correctly handled by 'body to satisfy' assertion

          await expect(
            { ...requestDefault, url: requestDefault.url.concat('?url=%2F') },
            'body to satisfy',
            { error: 'You are not authorized' }
          );
          await expect(
            { ...requestDefault, query: { url: '/' } },
            'body to satisfy',
            { error: 'You are not authorized' }
          );
        */
      });
    });
  });
});

describe('Bookmarks', () => {
  describe('GET /api/v1/url', () => {
    const requestDefault = {
      url: '/api/v1/url',
      method: 'GET'
    };

    describe('Authenticated users', () => {
      const reqWith = (url, meta = false) => ({
        ...requestDefault,
        session: sessionId,
        query: { url, meta }
      });
      let user, sessionId;

      before(async () => {
        const userAttrs = UserFactory.build();
        user = await User.create(userAttrs.username, userAttrs.password, userAttrs.email);
        user.set('email_check_hash', null);
        await user.save(null, { method: 'update' });

        sessionId = await login(userAttrs.username, userAttrs.password);
      });

      after(async () => {
        await user.destroy();
      });

      it('requires url query parameter', () =>
        expect(
          { ...requestDefault, session: sessionId },
          'to fail validation with',
          '"url" parameter is not given'
        )
      );

      it('returns error for external and invalid URL', () => {
        const expectedError = '"url" parameter isn\'t internal to LibertySoil website';
        const listOfInvalidUrls = [
          'google.com', 'www.google.com', 'http://google.com', 'https://google.com',
          'http://www.localhost:8000', 'http://www.localhost.com', 'https://localhost:8000',
          'ftp://localhost:8000/geo', 'ftp://localhost:8000',
          'www', 'http://', '?', '', 123, null
        ];

        const promises = [];
        for (const url of listOfInvalidUrls) {
          promises.push(expect(reqWith(url), 'to fail validation with', expectedError));
        }

        return Promise.all(promises);
      });

      it('returns error for non-existent internal URL', () => {
        const listOfInvalidUrls = [
          '/test', 'http://localhost:8000/test',
          '/123', 'http://localhost:8000/123'
        ];

        const promises = [];
        for (const url of listOfInvalidUrls) {
          promises.push(expect(reqWith(url), 'to open not found'));
        }

        return Promise.all(promises);
      });

      it('handles different versions of URL successfully', () => {
        const listOfValidUrls = [
          '/', 'localhost:8000', 'localhost:8000/', 'http://localhost:8000/',
          '/geo', 'localhost:8000/geo', 'http://localhost:8000/geo'
        ];

        const promises = [];
        for (const url of listOfValidUrls) {
          promises.push(expect(reqWith(url), 'to open successfully'));
        }

        return Promise.all(promises);
      });

      it('handles different char cases successfully', () => {
        const listOfValidUrls = [
          'LOCaLhost:8000', 'LOCALHOST:8000/', 'HTTP://LOCALHOST:8000/',
          '/GEO', 'locAlhOSt:8000/gEo', 'HTTP://LOCALHOST:8000/GEO'
        ];

        const promises = [];
        for (const url of listOfValidUrls) {
          promises.push(expect(reqWith(url), 'to open successfully'));
        }

        return Promise.all(promises);
      });

      describe('Fetches page metadata', () => {
        describe('common routes', () => {
          it('succeeds', async () => {
            const listOfUrls = [
              'localhost:8000/geo', '/geo', 'http://localhost:8000/geo',
              'localhost:8000/geo/', '/geo/', 'http://localhost:8000/geo/'
            ];

            const needMeta = true;
            const promises = [];
            for (const url of listOfUrls) {
              promises.push(expect(reqWith(url, needMeta), 'body to satisfy', {
                success: true,
                meta: { title: 'Geotags of LibertySoil.org' }
              }));
            }

            return Promise.all(promises);
          });
        });

        describe('routes with params', () => {
          let tag, user;
          before(done => {
            const userAttrs = UserFactory.build();
            tag = new Hashtag(HashtagFactory.build());

            Promise.all([
              tag.save(null, { method: 'insert' }),
              User.create(userAttrs.username, userAttrs.password, userAttrs.email)
            ]).then(([, u]) => { user = u; done(); }, e => done(e));
          });

          after(() =>
            Promise.all([tag.destroy(), user.destroy()])
          );

          it('succeed on hashtag\'s page', () => {
            const tagName = tag.get('name');
            const listOfUrls = [
              `localhost:8000/tag/${tagName}`, `localhost:8000/tag/${tagName}/`
            ];

            const needMeta = true;
            const promises = [];
            for (const url of listOfUrls) {
              promises.push(expect(reqWith(url, needMeta), 'body to satisfy', {
                success: true,
                meta: { title: `"${tagName}" posts on LibertySoil.org` }
              }));
            }

            return Promise.all(promises);
          });

          it('succeed on user\'s page', () => {
            const username = user.get('username');
            const listOfUrls = [
              `localhost:8000/user/${username}`, `localhost:8000/user/${username}/`
            ];

            const needMeta = true;
            const promises = [];
            for (const url of listOfUrls) {
              promises.push(expect(reqWith(url, needMeta), 'body to satisfy', {
                success: true,
                meta: { title: `Posts of ${username} on LibertySoil.org` }
              }));
            }

            return Promise.all(promises);
          });
        });
      });

      describe('Pages unavailable to user', () => {
        let post, author;

        before(async () => {
          const userAttrs = UserFactory.build();
          author = await User.create(userAttrs.username, userAttrs.password, userAttrs.email);
          await author.save({ email_check_hash: null }, { method: 'update' });

          post = new Post(PostFactory.build({ user_id: author.get('id') }));
          await post.save(null, { method: 'insert' });
        });

        after(async () => {
          await post.destroy();
          await author.destroy();
        });

        it('doesn\'t fetch metadata', () => {
          const needMeta = true;
          return expect(
            reqWith(`/post/edit/${post.get('id')}`, needMeta),
            'body to satisfy',
            {
              success: true,
              meta: { title: '' }
            }
          );
        });
      });
    });
  });
});
