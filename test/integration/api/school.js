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
import { uniq, sortBy, pick } from 'lodash';

import expect from '../../../test-helpers/expect';
import { bookshelf, knex } from '../../../test-helpers/db';
import { login } from '../../../test-helpers/api';

import { createUser } from '../../../test-helpers/factories/user';
import { createPosts } from '../../../test-helpers/factories/post';
import SchoolFactory, { createSchool, createSchools } from '../../../test-helpers/factories/school';

const School = bookshelf.model('School');

describe('School', () => {
  let user, school, session;

  before(async () => {
    await knex('schools').del(); // schools are leaking somewhere
    school = await createSchool({ name: 'some school' });
    user = await createUser();
    session = await login(user.get('username'), user.get('password'));
  });

  after(async () => {
    await user.destroy();
    await school.destroy();
  });

  describe('HEAD /api/v1/school/:name', () => {
    it('responds with 200 if school exists', async () => {
      await expect(
        {
          url: `/api/v1/school/${school.get('name')}`,
          method: 'HEAD',
        },
        'to open successfully',
      );
    });

    it('responds with 404 if school does not exist', async () => {
      await expect(
        {
          url: `/api/v1/school/nonexistent-school`,
          method: 'HEAD',
        },
        'to open not found',
      );
    });
  });

  describe('GET /api/v1/school/:url_name', () => {
    it('responds with school', async () => {
      await expect(
        {
          url: `/api/v1/school/${school.get('url_name')}`,
          method: 'GET'
        },
        'body to satisfy',
        { id: school.id }
      );
    });

    it('responds with 404 if school does not exist', async () => {
      await expect(
        {
          url: `/api/v1/school/nonexistent-school`,
          method: 'GET'
        },
        'to open not found',
      );
    });
  });

  describe('GET /api/v1/schools', function () {
    this.retries(4);

    let schools, schoolIds, allSchools;

    before(async () => {
      schools = await createSchools(10);
      schoolIds = schools.map(school => school.id);
      allSchools = sortBy([...schools, school].map(school => (
        pick(school.attributes, 'id', 'name', 'url_name', 'created_at')
      )), 'name');
    });

    after(async () => {
      await knex('schools').whereIn('id', schoolIds).del();
    });

    it('responds with schools', async () => {
      await expect(
        {
          url: `/api/v1/schools`,
          method: 'GET'
        },
        'body to satisfy',
        allSchools.map(school => pick(school, 'id', 'name'))
      );
    });

    it('responds with schools (offset, limit)', async () => {
      await expect(
        {
          url: `/api/v1/schools?limit=1&offset=1`,
          method: 'GET'
        },
        'body to satisfy',
        [{ id: allSchools[1].id }]
      );
    });

    it('responds with schools (sort)', async () => {
      await expect(
        {
          url: `/api/v1/schools?sort=-created_at`,
          method: 'GET'
        },
        'body to satisfy',
        sortBy(allSchools, 'created_at').map(school => pick(school, 'id', 'name')).reverse()
      );
    });
  });

  describe('GET /api/v1/school-cloud', () => {
    let schools;

    before(async () => {
      schools = await createSchools([
        { post_count: 2 },
        { post_count: 1 },
        { post_count: 0 },
      ]);
    });

    after(async () => {
      await knex('schools').whereIn('id', schools.map(school => school.id)).del();
    });

    it('responds with schools sorted by post_count', async () => {
      await expect(
        {
          url: `/api/v1/school-cloud`,
          method: 'GET'
        },
        'body to satisfy',
        [{ id: schools[0].id }, { id: schools[1].id }]
      );
    });
  });

  describe('GET /api/v1/schools-alphabet', () => {
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
      const letters = uniq(schools.map(s => s.get('name')[0].toUpperCase())).sort();

      await expect(
        { url: `/api/v1/schools-alphabet`, method: 'GET' },
        'body to satisfy',
        letters
      );
    });
  });

  describe('POST /api/v1/school/:url_name/follow', () => {
    after(async () => {
      await user.followed_schools().detach(school.id);
    });

    it('responds with school', async () => {
      await expect(
        {
          session,
          url: `/api/v1/school/${school.get('url_name')}/follow`,
          method: 'POST'
        },
        'body to satisfy',
        { success: true, school: { id: school.id } }
      );
    });
  });

  describe('POST /api/v1/school/:url_name/unfollow', () => {
    before(async () => {
      await user.followed_schools().attach(school.id);
    });

    it('responds with school', async () => {
      await expect(
        {
          session,
          url: `/api/v1/school/${school.get('url_name')}/unfollow`,
          method: 'POST'
        },
        'body to satisfy',
        { success: true, school: { id: school.id } }
      );
    });
  });

  describe('POST /api/v1/school/:url_name/like', () => {
    after(async () => {
      await user.liked_schools().detach(school.id);
    });

    it('responds with school', async () => {
      await expect(
        {
          session,
          url: `/api/v1/school/${school.get('url_name')}/like`,
          method: 'POST'
        },
        'body to satisfy',
        { success: true, school: { id: school.id } }
      );
    });
  });

  describe('POST /api/v1/school/:url_name/unlike', () => {
    before(async () => {
      await user.liked_schools().attach(school.id);
    });

    it('responds with school', async () => {
      await expect(
        {
          session,
          url: `/api/v1/school/${school.get('url_name')}/unlike`,
          method: 'POST'
        },
        'body to satisfy',
        { success: true, school: { id: school.id } }
      );
    });
  });

  describe('POST /api/v1/schools/new', () => {
    describe('Unauthenticated user', () => {
      it('responds with error', async () => {
        await expect(
          { url: '/api/v1/schools/new', method: 'POST', body: { name: 'test' } },
          'not to open authorized'
        );
      });
    });

    describe('Authenticated user', () => {
      describe('If school doesn\'t exist', () => {
        describe('Validation errors', () => {
          it('"name" property isn\'t given', async () => {
            await expect(
              {
                session,
                url: '/api/v1/schools/new',
                body: {},
                method: 'POST'
              },
              'to fail validation with',
              [{ path: 'name' }]
            );
          });

          it('"name" property is an empty string or contains only whitespace', async () => {
            await expect(
              {
                session,
                url: '/api/v1/schools/new',
                body: { name: '' },
                method: 'POST'
              },
              'to fail validation with',
              [{ path: 'name' }]
            );
            await expect(
              {
                session,
                url: '/api/v1/schools/new',
                body: { name: '     ' },
                method: 'POST'
              },
              'to fail validation with',
              [{ path: 'name' }]
            );
            await expect(
              {
                session,
                url: '/api/v1/schools/new',
                body: { name: ' \n\n  \r \t ' },
                method: 'POST'
              },
              'to fail validation with',
              [{ path: 'name' }]
            );
          });

          it("'is_open' has to be boolean or null", async () => {
            await expect(
              {
                session,
                url: '/api/v1/schools/new',
                body: { name: 'test', is_open: '' },
                method: 'POST'
              },
              'to fail validation with',
              [{ path: 'is_open' }]
            );
            await expect(
              {
                session,
                url: '/api/v1/schools/new',
                body: { name: 'test', is_open: 1 },
                method: 'POST'
              },
              'to fail validation with',
              [{ path: 'is_open' }]
            );
          });

          // TODO: add more validation tests
        });

        describe('Succeed', () => {
          after(async () => {
            await School.where({ name: 'test' }).destroy({ require: true });
          });

          it('creates school successfully', async () => {
            await expect(
              {
                session,
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
          });
        });
      });

      describe('If school exists', () => {
        let school, name;

        before(async () => {
          school = await createSchool();
          name = school.get('name');
        });

        after(async () => {
          await school.destroy();
          name = null;
        });

        it('responds with error', async () => {
          await expect(
            {
              session,
              url: '/api/v1/schools/new',
              body: { name },
              method: 'POST'
            },
            'body to satisfy',
            { error: 'School with such name is already registered' }
          );
          await expect(
            {
              session,
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

  describe('POST /api/v1/school/:id', () => {
    after(async () => {
      await school.save({ name: 'some school' }, { patch: true });
    });

    it('responds with updated school', async () => {
      await expect(
        {
          session,
          url: `/api/v1/school/${school.id}`,
          method: 'POST',
          body: {
            name: 'new name'
          }
        },
        'body to satisfy',
        { id: school.id, name: 'new name' }
      );
    });
  });

  describe('GET /api/v1/schools/:query', () => {
    it('responds with matching schools', async () => {
      await expect(
        {
          url: `/api/v1/schools/some`,
          method: 'GET'
        },
        'body to satisfy',
        { schools: [{ id: school.id }] }
      );
    });

    it('responds with empty array if nothing is found', async () => {
      await expect(
        {
          url: `/api/v1/schools/nonexistent`,
          method: 'GET'
        },
        'body to satisfy',
        { schools: [] }
      );
    });
  });

  describe('GET /api/v1/user/recent-schools', () => {
    const NUM_SCHOOLS = 5;
    let posts, schools, schoolIds;

    before(async () => {
      posts = await createPosts(Array.apply(null, Array(NUM_SCHOOLS)).map((_, i) => ({
        user_id: user.id,
        created_at: new Date(Date.UTC(2017, 10, i)),
      })));
      schools = await createSchools(NUM_SCHOOLS);
      schoolIds = schools.map(school => school.id);

      await Promise.all(schoolIds.map((id, i) => (
        posts[i].schools().attach(id)
      )));
    });

    after(async () => {
      await knex('posts').whereIn('id', posts.map(post => post.id)).del();
      await knex('schools').whereIn('id', schoolIds).del();
    });

    it('responds with 5 recently used schools', async () => {
      await expect(
        {
          session,
          url: `/api/v1/user/recent-schools`,
          method: 'GET'
        },
        'body to satisfy',
        schoolIds.map(id => ({ id })).reverse()
      );
    });
  });
});
