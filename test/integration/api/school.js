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
import { uniq } from 'lodash';

import expect from '../../../test-helpers/expect';
import { bookshelf } from '../../../test-helpers/db';
import SchoolFactory from '../../../test-helpers/factories/school';


const School = bookshelf.model('School');

describe('Post', () => {
  describe('/api/v1/schools-alphabet', () => {
    const schools = [];

    before(async () => {
      for (let i = 0; i < 2; ++i) {
        const school = await new School(SchoolFactory.build({ post_count: 1 })).save(null, { method: 'insert' });
        schools.push(school);
      }
    });

    after(() => {
      for (const school of schools) {
        school.destroy();
      }
    });

    it('responds with letters', async () => {
      const letters = uniq(schools.map(s => s.get('name')[0])).sort();

      await expect(
        { url: `/api/v1/schools-alphabet`, method: 'GET' },
        'body to satisfy',
        letters
      );
    });
  });
});
