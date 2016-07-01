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
import expect from '../../../test-helpers/expect';
import initBookshelf from '../../../src/api/db';
import PostFactory from '../../../test-helpers/factories/post';
import UserFactory from '../../../test-helpers/factories/user';

import { login } from '../../../test-helpers/api';

const bookshelf = initBookshelf($dbConfig);
const Post = bookshelf.model('Post');
const User = bookshelf.model('User');


describe('User', () => {
  let user;

  after(async () => {
    await user.destroy();
  });

  it('should work', async () => {
    const userAttrs = UserFactory.build();
    user = await User.create(userAttrs.username, userAttrs.password, userAttrs.email);

    user.set('email_check_hash', null);
    await user.save(null, { method: 'update' });
    const sessionId = await login(userAttrs.username, userAttrs.password);

    await expect(
      {
        session: sessionId,
        url: `/api/v1/suggestions/initial`,
        method: 'GET'
      },
      'to have body an array'
    );

  });
});
