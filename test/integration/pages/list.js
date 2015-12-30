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
import { v4 as uuid4 } from 'uuid';

import expect from '../../../test-helpers/expect';
import initBookshelf from '../../../src/api/db';
import { login } from '../../../test-helpers/api';


let bookshelf = initBookshelf($dbConfig);
let Post = bookshelf.model('Post');
let User = bookshelf.model('User');

describe('ListPage', () => {
  it('anonymous can not open /', async () => {
    await expect('/', 'to redirect');
  });

  describe('when user is logged in', () => {
    let user;
    let sessionId;

    beforeEach(async () => {
      await bookshelf.knex('users').del();
      user = await User.create('test', 'test', 'test@example.com');

      sessionId = await login('test', 'test');
    });

    afterEach(async () => {
      await user.destroy();
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
      let post;

      beforeEach(async () => {
        // FIXME: extract code from controller into model and reuse here
        post = new Post({
          id: uuid4(),
          type: 'short_text',
          user_id: user.get('id'),
          text: 'Lorem ipsum'
        });
        await post.save(null, {method: 'insert'});
      });

      afterEach(async () => {
        await post.destroy();
      });

      it('user can open / and see 1 post there', async () => {
        let context = await expect({ url: '/', session: sessionId }, 'to open successfully');

        let document = jsdom(context.httpResponse.body);

        let pageContent = await expect(document.body, 'queried for first', '#content>.page .page__content');
        await expect(pageContent, 'to have child', '.box-post');  // posting form

        let postsContainer = pageContent.childNodes[1];
        await expect(postsContainer, 'to have children');
      });
    });
  });
});
