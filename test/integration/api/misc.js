
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
import { readFile } from 'fs';
import bb from 'bluebird';
import faker from 'faker';
import { sortBy } from 'lodash';

import expect from '../../../test-helpers/expect';
import { login } from '../../../test-helpers/api';
import { createUser } from '../../../test-helpers/factories/user';
import { createPost, createPosts } from '../../../test-helpers/factories/post';
import { createHashtag, createHashtags } from '../../../test-helpers/factories/hashtag';
import { createSchool, createSchools } from '../../../test-helpers/factories/school';
import { createGeotag, createGeotags } from '../../../test-helpers/factories/geotag';
import { bookshelf, knex } from '../../../test-helpers/db';

const readFileAsync = bb.promisify(readFile);

describe('other controllers', () => {
  let user, session;

  before(async () => {
    user = await createUser();
    session = await login(user.get('username'), user.get('password'));
  });

  after(async () => {
    await user.destroy();
  });

  describe('GET /api/v1/locale/:lang_code', () => {
    let locale;

    before(async () => {
      const text = await readFileAsync('res/locale/en.json');
      locale = JSON.parse(text);
    });

    it('responds with localization in JSON format', async () => {
      await expect(
        {
          url: `/api/v1/locale/en`,
          method: `GET`,
        },
        'body to satisfy',
        locale
      );
    });
  });

  describe('GET /api/v1/quotes', () => {
    const Quote = bookshelf.model('Quote');
    const quotes = [];

    before(async () => {
      for (let i = 0; i < 2; ++i) {
        quotes.push(await new Quote({
          first_name: faker.name.firstName(),
          last_name: faker.name.firstName(),
          text: faker.lorem.paragraph(),
        }).save(null, { require: true }));
      }
    });

    after(async () => {
      await knex('quotes').whereIn('id', quotes.map(quote => quote.id)).del();
    });

    it('responds with quotes', async () => {
      await expect(
        {
          url: `/api/v1/quotes`,
          method: `GET`,
        },
        'body to satisfy',
        sortBy(quotes.map(quote => quote.attributes), 'last_name')
      );
    });
  });

  describe('GET /api/v1/user/tags', () => {
    let post, hashtag, school, geotag;

    before(async () => {
      post = await createPost({ user_id: user.id });
      hashtag = await createHashtag();
      school = await createSchool();
      geotag = await createGeotag();
      await post.hashtags().attach(hashtag.id);
      await post.schools().attach(school.id);
      await post.geotags().attach(geotag.id);
    });

    after(async () => {
      await Promise.all([
        post.destroy(),
        hashtag.destroy(),
        school.destroy(),
        geotag.destroy(),
      ]);
    });

    it("responds with current user's tags", async () => {
      await expect(
        {
          session,
          url: `/api/v1/user/tags`,
          method: 'GET',
        },
        'body to satisfy',
        {
          hashtags: [{ id: hashtag.id }],
          schools: [{ id: school.id }],
          geotags: [{ id: geotag.id }],
        }
      );
    });
  });

  describe('GET /api/v1/recent-tags', () => {
    let posts, hashtagIds, schoolIds, geotagIds;

    before(async () => {
      posts = await createPosts(
        Array.apply(null, Array(5))
          .map((_, i) => ({ created_at: new Date(Date.UTC(2017, 11, i)) }))
      );
      hashtagIds = (await createHashtags(6)).map(t => t.id);
      schoolIds = (await createSchools(6)).map(t => t.id);
      geotagIds = (await createGeotags(6)).map(t => t.id);

      for (const [i, post] of posts.entries()) {
        await post.hashtags().attach(hashtagIds[i]);
        await post.schools().attach(schoolIds[i]);
        await post.geotags().attach(geotagIds[i]);
      }
    });

    after(async () => {
      await knex('hashtags').whereIn('id', hashtagIds).del();
      await knex('schools').whereIn('id', schoolIds).del();
      await knex('geotags').whereIn('id', geotagIds).del();
      await knex('posts').whereIn('id', posts.map(post => post.id)).del();
    });

    it('responds with 5 recently used tags of all types', async () => {
      await expect(
        {
          method: 'GET',
          url: `/api/v1/recent-tags`
        },
        'body to satisfy',
        {
          hashtags: {
            entries: hashtagIds.slice(0, 5).reverse().map(id => ({ id })),
            post_count: 0, // only counts posts created withing last 24 hours
          },
          schools: {
            entries: schoolIds.slice(0, 5).reverse().map(id => ({ id })),
            post_count: 0,
          },
          geotags: {
            entries: geotagIds.slice(0, 5).reverse().map(id => ({ id })),
            post_count: 0,
          }
        }
      );
    });
  });
});
