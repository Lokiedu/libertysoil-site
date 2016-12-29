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
import uuid from 'uuid';
import { keyBy } from 'lodash';

import expect from '../../../test-helpers/expect';
import initBookshelf from '../../../src/api/db';

import UserFactory from '../../../test-helpers/factories/user';
import HashtagFactory from '../../../test-helpers/factories/hashtag';
import BookmarkFactory from '../../../test-helpers/factories/bookmark';
import PostFactory from '../../../test-helpers/factories/post';
import { login } from '../../../test-helpers/api';

const bookshelf = initBookshelf($dbConfig);
const User = bookshelf.model('User');
const Bookmark = bookshelf.model('Bookmark');
const Post = bookshelf.model('Post');
const Hashtag = bookshelf.model('Hashtag');

describe('Bookmarks', () => {
  describe('GET /api/v1/url', () => {
    describe('Not authenticated users', () => {
      const requestDefault = {
        url: '/api/v1/url',
        method: 'GET'
      };

      it('fails', async () => {
        await expect(
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
      })
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
        let userAttrs = UserFactory.build();
        user = await User.create(userAttrs.username, userAttrs.password, userAttrs.email);
        user.set('email_check_hash', null);
        await user.save(null, { method: 'update' });
        
        sessionId = await login(userAttrs.username, userAttrs.password);
      });

      after(async () => {
        await user.destroy();
      });

      it('requires url query parameter', async () => {
        await expect(
          { ...requestDefault, session: sessionId },
          'to fail validation with',
          '"url" parameter is not given'
        );
      });

      it('returns error for external and invalid URL', async () => {
        const expectedError = '"url" parameter isn\'t internal to LibertySoil website';
        const listOfInvalidUrls = [
          'google.com', 'www.google.com', 'http://google.com', 'https://google.com',
          'http://www.localhost:8000', 'http://www.localhost.com', 'https://localhost:8000',
          'ftp://localhost:8000/geo', 'ftp://localhost:8000',
          'www', 'http://', '?', '', 123, null
        ];

        for (let url of listOfInvalidUrls) {
          await expect(reqWith(url), 'to fail validation with', expectedError);
        }
      });

      it('returns error for non-existent internal URL', async () => {
        const listOfInvalidUrls = [
          '//', 'localhost:8000//', 'http://localhost:8000//',
          '/test', 'http://localhost:8000/test',
          '/123', 'http://localhost:8000/123'
        ];

        for (let url of listOfInvalidUrls) {
          await expect(reqWith(url), 'to open not found');
        }
      });

      it('handles different versions of URL successfully', async () => {
        const listOfValidUrls = [
          '/', 'localhost:8000', 'localhost:8000/', 'http://localhost:8000/',
          '/geo', 'localhost:8000/geo', 'http://localhost:8000/geo'
        ];

        for (let url of listOfValidUrls) {
          await expect(reqWith(url), 'to open successfully');
        }
      });

      it('handles different char cases successfully', async () => {
        const listOfValidUrls = [
          'LOCaLhost:8000', 'LOCALHOST:8000/', 'HTTP://LOCALHOST:8000/',
          '/GEO', 'locAlhOSt:8000/gEo', 'HTTP://LOCALHOST:8000/GEO'
        ];

        for (let url of listOfValidUrls) {
          await expect(reqWith(url), 'to open successfully');
        }
      });

      describe('Fetches page metadata', () => {
        describe('common routes', () => {
          it('succeeds', async () => {
            const listOfUrls = [
              'localhost:8000/geo', '/geo', 'http://localhost:8000/geo',
              'localhost:8000/geo/', '/geo/', 'http://localhost:8000/geo/'
            ];

            const needMeta = true;
            for (const url of listOfUrls) {
              await expect(reqWith(url, needMeta), 'body to satisfy', {
                success: true,
                meta: { title: 'Geotags of LibertySoil.org' }
              });
            }
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

          it('succeed on hashtag\'s page', async () => {
            const tagName = tag.get('name');
            const listOfUrls = [
              `localhost:8000/tag/${tagName}`, `localhost:8000/tag/${tagName}/`
            ];

            const needMeta = true;
            for (const url of listOfUrls) {
              await expect(reqWith(url, needMeta), 'body to satisfy', {
                success: true,
                meta: { title: `"${tagName}" posts on LibertySoil.org` }
              });
            }
          });

          it('succeed on user\'s page', async () => {
            const username = user.get('username');
            const listOfUrls = [
              `localhost:8000/user/${username}`, `localhost:8000/user/${username}/`
            ];

            const needMeta = true;
            for (const url of listOfUrls) {
              await expect(reqWith(url, needMeta), 'body to satisfy', {
                success: true,
                meta: { title: `Posts of ${username} on LibertySoil.org` }
              });
            }
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

        it('doesn\'t fetch metadata', async () => {
          const needMeta = true;
          await expect(
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

  describe('POST /api/v1/bookmarks', () => {
    describe('Authenticated users', () => {
      let user, sessionId;
      const reqWith = (bookmark) => ({
        url: '/api/v1/bookmarks',
        method: 'POST',
        body: bookmark,
        session: sessionId,
      });

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

      describe('handle different url versions successfully', () => {
        before(async () => {
          await Bookmark.collection().query(qb => qb
            .delete()
            .where({ user_id: user.get('id') })
          ).fetch();
        });

        afterEach(async () => {
          await Bookmark.collection().query(qb => qb
            .delete()
            .where({ user_id: user.get('id') })
          ).fetch();
        });

        it('addresses with 1 level depth', async () => {
          const urls = [
            '/s', '/s/',
            'localhost:8000/s', 'localhost:8000/s/',
            'http://localhost:8000/s', 'http://localhost:8000/s/'
          ];
          const bookmark = {
            title: 'Schools',
            more: { description: 'All schools page' }
          };

          for (let i = 0; i < urls.length; ++i) {
            await expect(reqWith({ ...bookmark, url: urls[i] }), 'body to satisfy', {
              success: true,
              affected: {},
              target: { ...bookmark, ord: i + 1, url: '/s' }
            });
          }
        });

        it('addresses with 2 level depth', async () => {
          const username = user.get('username');
          const urls = [
            `/user/${username}`, `/user/${username}/`,
            `localhost:8000/user/${username}/`, `localhost:8000/user/${username}/`,
            `http://localhost:8000/user/${username}/`, `http://localhost:8000/user/${username}/`
          ];
          const bookmark = {
            title: `Posts of ${username} on LibertySoil.org`,
            more: { description: 'Profile' }
          };

          for (let i = 0; i < urls.length; ++i) {
            await expect(reqWith({ ...bookmark, url: urls[i] }), 'body to satisfy', {
              success: true,
              affected: {},
              target: { ...bookmark, ord: i + 1, url: `/user/${username}` }
            });
          }
        });
      });

      it('create bookmark successfully', async () => {
        const bookmark = {
          more: { description: 'All schools page' },
          title: 'All schools',
          url: '/s'
        };

        await expect(reqWith(bookmark), 'body to satisfy', {
          success: true,
          affected: {},
          target: bookmark
        });
      });

      xit('fetches successfully', async () => {
        await expect(
          { url: '/s/' }, 'when parsed as HTML',
          'queried for', 'title', 'to have text',
          'All schools'
        );
      });
    });
  });

  describe('DELETE /api/v1/bookmark/:id', () => {
    const requestFor = (bookmarkId, sessionId) => ({
      method: 'DELETE',
      url: `/api/v1/bookmark/${bookmarkId}`,
      session: sessionId
    });

    describe('User doesn\'t have permissions', () => {
      let bookmark, sessionId, userAttrs, users = [];

      before(async () => {
        for (let i = 0; i < 2; ++i) {
          userAttrs = UserFactory.build();
          users.push(await User.create(userAttrs.username, userAttrs.password, userAttrs.email));
          await users[i].save({ email_check_hash: null }, { method: 'update' });
        }

        bookmark = new Bookmark(BookmarkFactory.build({ user_id: users[0].get('id') }));
        bookmark.set('ord', 1);
        await bookmark.save(null, { method: 'insert' });

        sessionId = await login(users[1].get('username'), userAttrs.password);
      });

      after(async () => {
        await bookmark.destroy();
        for (let i = 0; i < users.length; ++i) {
          await users[i].destroy();
        }
        users = [];
      });

      describe('Anonymous user', () => {
        it('fails with 403', async () => {
          await expect(
            requestFor(bookmark.get('id'), undefined),
            'body to satisfy',
            { error: 'You are not authorized' }
          );
        });
      });

      describe('Non-author', () => {
        it('fails with 403', async () => {
          await expect(
            requestFor(bookmark.get('id'), sessionId),
            'body to satisfy',
            { error: 'You are not authorized' }
          );
        });
      });
    });

    describe('When the bookmark doesn\'t exist', () => {
      let user, sessionId;

      before(async () => {
        const userAttrs = UserFactory.build();
        user = await User.create(userAttrs.username, userAttrs.password, userAttrs.email);
        await user.save({ email_check_hash: null }, { method: 'update' });
        sessionId = await login(userAttrs.username, userAttrs.password);
      });

      after(async () => {
        await user.destroy();
      });

      it('fails with 404', async () => {
        await expect(requestFor(uuid.v4(), sessionId), 'to open not found');
      });
    });

    describe('When the bookmark exists', () => {
      let bookmark, bookmarkId,
          user, sessionId;

      before(async () => {
        const userAttrs = UserFactory.build();
        user = await User.create(userAttrs.username, userAttrs.password, userAttrs.email);
        await user.save({ email_check_hash: null }, { method: 'update' });
        sessionId = await login(userAttrs.username, userAttrs.password);
      });

      beforeEach(async () => {
        bookmark = new Bookmark(BookmarkFactory.build({ user_id: user.get('id') }));
        bookmark.set('ord', 1);
        await bookmark.save(null, { method: 'insert' });
        bookmarkId = bookmark.get('id');
      });

      afterEach(async () => {
        await bookmark.destroy();
      });

      after(async () => {
        await user.destroy();
      });

      describe('When user has only one', () => {
        it('succeeds', async () => {
          await expect(
            requestFor(bookmarkId, sessionId),
            'body to satisfy',
            {
              success: true,
              affected: { [bookmarkId]: null }
            }
          );
        });
      });

      describe('When deleted bookmark is last by order', () => {
        const EXTRA_BOOKMARKS_NUMBER = 5;
        let bookmarks = [];

        beforeEach(async () => {
          const b = await Bookmark.where({ id: bookmarkId }).fetch({ require: true });
          b.attributes.ord = EXTRA_BOOKMARKS_NUMBER;
          await b.save(null, { method: 'update' });

          for (let i = 0; i < EXTRA_BOOKMARKS_NUMBER; ++i) {
            bookmarks.push(new Bookmark(BookmarkFactory.build({ user_id: user.get('id') })));
            bookmarks[i].set('ord', i);
            await bookmarks[i].save(null, { method: 'insert' });
          }
        });

        afterEach(async () => {
          for (let i = 0; i < EXTRA_BOOKMARKS_NUMBER; ++i) {
            await bookmarks[i].destroy();
          }
          bookmarks = [];
        });

        it('succeeds with no effect to another bookmarks', async () => {
          await expect(
            requestFor(bookmarkId, sessionId),
            'body to satisfy',
            {
              success: true,
              affected: { [bookmarkId]: null }
            }
          );
          
          let restBookmarks = await Bookmark.collection()
            .query(qb =>
              qb
                .where({ user_id: user.get('id') })
                .andWhere('ord', '>=', 0)
                .andWhere('ord', '<', EXTRA_BOOKMARKS_NUMBER)
                .orderBy('ord', 'asc')
            )
            .fetch();
          restBookmarks = await restBookmarks.toJSON();
          restBookmarks = keyBy(restBookmarks, 'id');

          const bookmarksJson = [];
          for (let i = 0; i < EXTRA_BOOKMARKS_NUMBER; ++i) {
            bookmarksJson.push(await bookmarks[i].toJSON());
          }

          expect(restBookmarks, 'to satisfy', keyBy(bookmarksJson, 'id'));
        });
      });

      describe('When deleted bookmark is first by order', () => {
        const EXTRA_BOOKMARKS_NUMBER = 5;
        let bookmarks = {};

        beforeEach(async () => {
          for (let i = 2; i < EXTRA_BOOKMARKS_NUMBER + 2; ++i) {
            const bAttrs = BookmarkFactory.build({ user_id: user.get('id') });
            bookmarks[bAttrs.id] = new Bookmark(bAttrs);
            bookmarks[bAttrs.id].set('ord', i);
            await bookmarks[bAttrs.id].save(null, { method: 'insert' });
          }
        });

        afterEach(async () => {
          for (const id in bookmarks) {
            await bookmarks[id].destroy();
          }
          bookmarks = {};
        });

        it('succeeds and decreases the order value of other bookmarks', async () => {
          const bookmarksJson = {};
          for (const id in bookmarks) {
            bookmarksJson[id] = await bookmarks[id].toJSON();
            --bookmarksJson[id].ord;
          }

          await expect(
            requestFor(bookmarkId, sessionId),
            'body to satisfy',
            {
              success: true,
              affected: { ...bookmarksJson, [bookmarkId]: null }
            }
          );
        });
      });

      describe('When deleted bookmark is in the middle', () => {
        const EXTRA_BOOKMARKS_NUMBER = 5,
              DELETE_ORD = 2;
        let bookmarks = {};

        beforeEach(async () => {
          bookmark.set('ord', DELETE_ORD);
          await bookmark.save(null, { method: 'update' });

          for (let i = 0; i < EXTRA_BOOKMARKS_NUMBER; ++i) {
            if (i === DELETE_ORD) {
              continue;
            }

            const bAttrs = BookmarkFactory.build({ user_id: user.get('id') });
            bookmarks[bAttrs.id] = new Bookmark(bAttrs);
            bookmarks[bAttrs.id].set('ord', i);
            await bookmarks[bAttrs.id].save(null, { method: 'insert' });
          }
        });

        afterEach(async () => {
          for (const id in bookmarks) {
            await bookmarks[id].destroy();
          }

          bookmarks = {};
        });

        it('succeeds and decreases the order of bookmarks after it', async () => {
          const bookmarksJson = {};
          for (const id in bookmarks) {
            const b = await bookmarks[id].toJSON();
            if (b.ord > DELETE_ORD) {
              --b.ord;
              bookmarksJson[id] = b;
            }
          }

          await expect(
            requestFor(bookmarkId, sessionId),
            'body to satisfy',
            {
              success: true,
              affected: { ...bookmarksJson, [bookmarkId]: null }
            }
          )
        });
      });
    });
  });
});
