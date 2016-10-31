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
import { login } from '../../../test-helpers/api';

import UserFactory from '../../../test-helpers/factories/user';
import SchoolFactory from '../../../test-helpers/factories/school';

const User = bookshelf.model('User');
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

    after(async () => {
      for (const school of schools) {
        await school.destroy();
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

  describe('/api/v1/schools/new', () => {
    describe('Not authenticated user', () => {
      it('responds with error', async () => {
        await expect(
          { url: '/api/v1/schools/new', method: 'POST', body: { name: 'test' } },
          'not to open authorized'
        );
      });
    });

    describe('Authenticated user', () => {
      let user, sessionId;

      before(async () => {
        const userAttrs = UserFactory.build();
        user = await User.create(userAttrs.username, userAttrs.password, userAttrs.email);

        user.set('email_check_hash', null);
        await user.save(null, { method: 'update' });
        sessionId = await login(userAttrs.username, userAttrs.password);
      });

      after(async () => {
        await user.destroy();
        sessionId = null;
      });

      describe('If school doesn\'t exist', () => {
        describe('Validation errors', () => {
          it('"name" property isn\'t given', async () => {
            await expect(
              {
                session: sessionId,
                url: '/api/v1/schools/new',
                body: {},
                method: 'POST'
              },
              'to fail validation with',
              '"name" property is not given'
            );
          });

          it('"name" property is an empty string or contains only whitespace', async () => {
            await expect(
              {
                session: sessionId,
                url: '/api/v1/schools/new',
                body: { name: '' },
                method: 'POST'
              },
              'to fail validation with',
              '"name" mustn\'t be an empty string'
            );
            await expect(
              {
                session: sessionId,
                url: '/api/v1/schools/new',
                body: { name: '     ' },
                method: 'POST'
              },
              'to fail validation with',
              '"name" mustn\'t be an empty string'
            );
            await expect(
              {
                session: sessionId,
                url: '/api/v1/schools/new',
                body: { name: ' \n\n  \r \t ' },
                method: 'POST'
              },
              'to fail validation with',
              '"name" mustn\'t be an empty string'
            );
          });

          it("'is_open' has to be boolean or null", async () => {
            await expect(
              {
                session: sessionId,
                url: '/api/v1/schools/new',
                body: { name: 'test', is_open: '' },
                method: 'POST'
              },
              'body to satisfy',
              { error: "'is_open' has to be boolean or null" }
            );
            await expect(
              {
                session: sessionId,
                url: '/api/v1/schools/new',
                body: { name: 'test', is_open: '' },
                method: 'POST'
              },
              'body to satisfy',
              { error: "'is_open' has to be boolean or null" }
            );
            await expect(
              {
                session: sessionId,
                url: '/api/v1/schools/new',
                body: { name: 'test', is_open: 1 },
                method: 'POST'
              },
              'body to satisfy',
              { error: "'is_open' has to be boolean or null" }
            );
          });

          // TODO: add more validation tests
        });

        describe('Succeed', () => {
          it('creates school successfully', async () => {
            await expect(
              {
                session: sessionId,
                url: '/api/v1/schools/new',
                body: { name: 'test' },
                method: 'POST'
              },
              'body to satisfy',
              {
                more: { last_editor: user.get('id') },
                name: 'test',
                post_count: 0,
                url_name: 'test'
              }
            );

            const school = await School.where({ name: 'test' }).fetch({ require: true });
            await school.destroy();
          });
        });
      });

      describe('If school exists', () => {
        let school, name;

        before(async () => {
          school = await new School(SchoolFactory.build()).save(null, { method: 'insert' });
          name = school.get('name');
        });

        after(async () => {
          await school.destroy();
          name = null;
        });

        it('responds with error', async () => {
          await expect(
            {
              session: sessionId,
              url: '/api/v1/schools/new',
              body: { name },
              method: 'POST'
            },
            'body to satisfy',
            { error: 'School with such name is already registered' }
          );
          await expect(
            {
              session: sessionId,
              url: '/api/v1/schools/new',
              body: { name: `${name} ` },
              method: 'POST'
            },
            'body to satisfy',
            { error: 'School with such name is already registered' }
          );
        });
      });
    });
  });
});
