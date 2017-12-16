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
import { JSDOM } from 'jsdom';
import { v4 as uuid4 } from 'uuid';

import expect from '../../../test-helpers/expect';
import initBookshelf from '../../../src/api/db';


const bookshelf = initBookshelf($dbConfig);
const Post = bookshelf.model('Post');
const User = bookshelf.model('User');

describe('Tag Cloud page', () => {
  let post, user;

  before(async () => {
    await bookshelf.knex('users').del();
    await bookshelf.knex('posts').del();

    user = await User.create({
      username: 'test',
      password: 'test',
      email: 'test@example.com',
      more: { first_login: false }
    });
    post = new Post({
      id: uuid4(),
      type: 'short_text',
      text: 'Lorem ipsum',
      user_id: user.get('id')
    });

    await post.save(null, { method: 'insert' });
    await post.attachHashtags(['foo-hashtag-name']);
  });

  after(async () => {
    await post.destroy();
    await user.destroy();
  });

  it('can open tag page and see cloud', async () => {
    const context = await expect({ url: '/tag' }, 'to open successfully');

    const { document } = (new JSDOM(context.httpResponse.body)).window;
    const tagsContent = await expect(document.body, 'queried for first', '#content>.page .page__content .tags');
    await expect(tagsContent, 'to have child', '.tag__name');  // posting form

    const tag = await expect(tagsContent, 'queried for first', '.tag__name');
    await expect(tag, 'to have text', 'foo-hashtag-name');
  });

  describe('Specific hashtag page', () => {
    it('works for existing hashtag', async () => {
      const context = await expect({ url: '/tag/foo-hashtag-name' }, 'to open successfully');

      const { document } = (new JSDOM(context.httpResponse.body)).window;
      await expect(
        document.head,
        'queried for first', 'title',
        'to have text', '"foo-hashtag-name" posts on LibertySoil.org'
      );
    });

    it('renders NotFound page for non-existent hashtag', async () => {
      const context = await expect({ url: '/tag/ghbvth' }, 'to open not found');

      const { document } = (new JSDOM(context.httpResponse.body)).window;
      await expect(
        document.head,
        'queried for first', 'title',
        'to have text', 'Page not found at LibertySoil.org'
      );
    });
  });
});
