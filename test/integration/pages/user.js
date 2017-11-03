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

import initBookshelf from '../../../src/api/db';
import expect from '../../../test-helpers/expect';
import UserFactory from '../../../test-helpers/factories/user';

const bookshelf = initBookshelf($dbConfig);
const User = bookshelf.model('User');

describe('User page', () => {
  describe('User does not exist', () => {
    it('renders NotFound page', async () => {
      const context = await expect({ url: '/user/fake-user' }, 'to open not found');

      const { document } = (new JSDOM(context.httpResponse.body)).window;
      await expect(
        document.head,
        'queried for first', 'title',
        'to have text', 'Page not found at LibertySoil.org'
      );
    });
  });

  describe('User exists', () => {
    let user;
    before(async () => {
      const userAttrs = UserFactory.build();
      user = await User.create(userAttrs);
    });

    after(() => user.destroy());

    it('renders normal User page', async () => {
      const username = user.get('username');
      const fullName = `${user.get('more').firstName} ${user.get('more').lastName}`;
      const context = await expect({ url: `/user/${username}` }, 'to open successfully');

      const { document } = (new JSDOM(context.httpResponse.body)).window;
      await expect(
        document.head,
        'queried for first', 'title',
        'to have text', `Posts of ${fullName} on LibertySoil.org`
      );
    });
  });
});
