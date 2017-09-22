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
import { login } from '../../../test-helpers/api';
import UserFactory from '../../../test-helpers/factories/user';
import PostFactory from '../../../test-helpers/factories/post';
import SchoolFactory from '../../../test-helpers/factories/school';
import initBookshelf from '../../../src/api/db';

const bookshelf = initBookshelf($dbConfig);
const Post = bookshelf.model('Post');
const User = bookshelf.model('User');
const School = bookshelf.model('School');

describe('School page', () => {
  // before(() => {
  //   sinon.stub(console, 'error').callsFake((warning) => { throw new Error(warning); });
  // });

  // after(() => {
  //   console.error.restore();
  // });
  it('renders NotFound page for non-existent school', async () => {
    const context = await expect({ url: '/s/non-existent-school' }, 'to open not found');

    const { document } = (new JSDOM(context.httpResponse.body)).window;
    await expect(
      document.head,
      'queried for first', 'title',
      'to have text', 'Page not found at LibertySoil.org'
    );
  });

  describe('when user is logged in', () => {
    let user;
    let sessionId;

    before(async () => {
      await bookshelf.knex('users').del();
      user = await User.create('test', 'test', 'test@example.com', { first_login: false });
      await user.save({ 'email_check_hash': '' }, { require: true });

      sessionId = await login('test', 'test');
    });

    after(async () => {
      await user.destroy();
    });

    describe('Check counters', async () => {
      let author, school;
      const posts = new Array(2);

      before(async () => {
        await bookshelf.knex('posts').del();
        await bookshelf.knex('schools').del();

        const userAttrs = UserFactory.build();

        author = await User.create(userAttrs.username, userAttrs.password, userAttrs.email, { first_login: false });
        school = await new School(SchoolFactory.build()).save(null, { method: 'insert' });

        for (let i = 0; i < posts.length; ++i) {
          const uuid4Example = uuid4();

          posts[i] = await new Post(PostFactory.build({
            id: uuid4Example,
            url_name: uuid4Example, // approximate analog of actual post.url_name
            user_id: author.id
          })).save(null, { method: 'insert' });
        }
      });

      after(async () => {
        for (let i = 0; i < posts.length; ++i) {
          await posts[i].destroy();
        }

        await school.destroy();
        await author.destroy();
      });

      it('displays posts counter', async () => {
        await posts[0].attachSchools([school.get('name')]);
        {
          const context = await expect({
            url: `/s/${school.get('url_name')}`,
            session: sessionId
          }, 'to open successfully');

          const { document } = (new JSDOM(context.httpResponse.body)).window;

          const content = await expect(
            document.body,
            'queried for first',
            '#content .panel__toolbar_item-text'
          );
          await expect(content, 'to have text', '1 post');
        }

        await posts[1].attachSchools([school.get('name')]);
        {
          const context = await expect({
            url: `/s/${school.get('url_name')}`,
            session: sessionId
          }, 'to open successfully');

          const { document } = (new JSDOM(context.httpResponse.body)).window;

          const content = await expect(
            document.body,
            'queried for first',
            '#content .panel__toolbar_item-text'
          );

          await expect(content, 'to have text', '2 posts');
        }
      });
    });
  });
});
