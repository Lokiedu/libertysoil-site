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


let bookshelf = initBookshelf($dbConfig);
let Post = bookshelf.model('Post');

describe('Tag Cloud page', () => {
  let post;

  before(async () => {
    await bookshelf.knex('posts').del();

    post = new Post({
      id: uuid4(),
      type: 'short_text',
      text: 'Lorem ipsum'
    });

    await post.save(null, {method: 'insert'});
    await post.attachHashtags(['foo-hashtag-name']);
  });

  after(async () => {
    await post.destroy();
  });

  it('can open tag page and see cloud', async () => {
    let context = await expect({ url: '/tag' }, 'to open successfully');

    let document = jsdom(context.httpResponse.body);
    let tagsContent = await expect(document.body, 'queried for first', '#content>.page .page__body .tags');
    await expect(tagsContent, 'to have child', '.tag__name');  // posting form

    let tag = await expect(tagsContent, 'queried for first', '.tag__name');
    await expect(tag, 'to have text', 'foo-hashtag-name');

  });

  it('specific tag page works', async () => {
    let context = await expect({ url: '/tag/foo-hashtag-name' }, 'to open successfully');
  });

});
