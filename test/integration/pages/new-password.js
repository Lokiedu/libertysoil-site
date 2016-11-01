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
import sinon from 'sinon';

import expect from '../../../test-helpers/expect';
import initBookshelf from '../../../src/api/db';
import { login } from '../../../test-helpers/api';


let bookshelf = initBookshelf($dbConfig);
let User = bookshelf.model('User');

describe('NewPassword page', () => {

  describe('when user is logged in', () => {
    let user;

    before(async () => {
      // sinon.stub(console, 'error', (warning) => { throw new Error(warning); });
      await bookshelf.knex('users').del();
      user = await User.create('test', 'test', 'test@example.com');
      await user.save({email_check_hash: '', reset_password_hash: 'foo'},{require:true});
    });

    after(async () => {
      await user.destroy();
      // console.error.restore();
    });

    it('user can open new password page and see form', async () => {
      let context = await expect({ url: '/newpassword/foo' }, 'to open successfully');

      let document = jsdom(context.httpResponse.body);
      let pageContent = await expect(document.body, 'queried for first', '#content>.page .page__body form.password-form');
    });

  });
});
