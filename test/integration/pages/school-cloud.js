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
let School = bookshelf.model('School');

describe('School Cloud page', () => {
  let post, school;

  before(async () => {
    await bookshelf.knex('posts').del();
    await bookshelf.knex('schools').del();

    post = new Post({
      id: uuid4(),
      type: 'short_text',
      text: 'Lorem ipsum'
    });

    school = new School({
      id: uuid4(),
      name: 'foo-school'
    });

    await post.save(null, {method: 'insert'});
    await school.save(null, {method: 'insert'});
    await post.attachSchools(['foo-school']);
  });

  after(async () => {
    await post.destroy();
    await school.destroy();
  });

  it('can open school page and see cloud', async () => {
    let context = await expect({ url: '/s' }, 'to open successfully');

    let document = jsdom(context.httpResponse.body);
    let tagsContent = await expect(document.body, 'queried for first', '#content>.page .page__body .tags');
    await expect(tagsContent, 'to have child', '.tag__name');

    let tag = await expect(tagsContent, 'queried for first', '.tag__name');
    await expect(tag, 'to have text', 'foo-school');

  });

});
