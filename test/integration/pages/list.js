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
import { jsdom } from 'jsdom';
// import sinon from 'sinon';

import expect from '../../../test-helpers/expect';
import initBookshelf from '../../../src/api/db';
import { login } from '../../../test-helpers/api';
import { createPost } from '../../../test-helpers/factories/post';
import { LOAD_MORE_LIMIT } from '../../../src/pages/list';


const bookshelf = initBookshelf($dbConfig);
const User = bookshelf.model('User');

describe('ListPage', () => {
  // before(() => {
  //   sinon.stub(console, 'error', (warning) => { throw new Error(warning); });
  // });

  // after(() => {
  //   console.error.restore();
  // });

  it('anonymous can not open /', async () => {
    await expect('/', 'to redirect');
  });

  describe('when user is logged in', () => {
    let user;
    let sessionId;
    const posts = [];

    before(async () => {
      await bookshelf.knex('users').del();
      user = await User.create('test', 'test', 'test@example.com', { first_login: false });
      await user.save({'email_check_hash': ''},{require:true});

      sessionId = await login('test', 'test');
    });

    after(async () => {
      await user.destroy();
    });

    beforeEach(async () => {
    });

    afterEach(async () => {
      posts.forEach(async (post) => {
        await post.destroy();
      });
    });

    it('user can open / and see posting form', async () => {
      let context = await expect({ url: '/', session: sessionId }, 'to open successfully');

      let document = jsdom(context.httpResponse.body);

      let pageContent = await expect(document.body, 'queried for first', '#content>.page .page__content');
      await expect(pageContent, 'to have child', '.box-post');  // posting form

      let postsContainer = pageContent.childNodes[1];
      await expect(postsContainer, 'to have no children');
    });

    describe('when user made a post', () => {

      it('user can open / and see 1 post there', async () => {
        const posts = [];
        posts.push(await createPost(user));
        const context = await expect({ url: '/', session: sessionId }, 'to open successfully');

        const document = jsdom(context.httpResponse.body);

        const pageContent = await expect(document.body, 'queried for first', '#content>.page .page__content');
        await expect(pageContent, 'to contain elements matching', '.box-post');  // posting form
        await expect(pageContent, 'to contain elements matching', '.card');  // post card
        await expect(pageContent, 'to contain no elements matching', 'button[title="Load more..."]');  // no load more button
      });

      it('Load more button is visible', async () => {
        const posts = [];
        for (let i = 0; i < LOAD_MORE_LIMIT + 1; ++i) { // create one more posts than limit on list page
          posts.push(await createPost(user));
        }
        const context = await expect({ url: '/', session: sessionId }, 'to open successfully');

        const document = jsdom(context.httpResponse.body);

        const pageContent = await expect(document.body, 'queried for first', '#content>.page .page__content');
        await expect(pageContent, 'to contain elements matching', 'button[title="Load more..."]');  // no load more button
      });
    });
  });
});
