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
import expect from '../../test-helpers/expect';
import initBookshelf from '../../src/api/db';
import { login } from '../../test-helpers/api';


let bookshelf = initBookshelf($dbConfig);
let Post = bookshelf.model('Post');
let User = bookshelf.model('User');

describe('api version 1', () => {

  describe('Posts', () => {

    describe('When user not logged it', () => {
      it('can not get subsciptions', async () => {
        await expect({ url: '/posts' }, 'not to open');
      });

      it('can not create post', async () => {
        await expect({ url: '/posts', method: 'POST' }, 'not to open');
      });
    });

  });

});
