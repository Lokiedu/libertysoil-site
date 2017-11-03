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
import { sortBy, pick } from 'lodash';

import expect from '../../../test-helpers/expect';
import { login } from '../../../test-helpers/api';
import { createUser } from '../../../test-helpers/factories/user';
import { createGeotag, createGeotags } from '../../../test-helpers/factories/geotag';
import { createPosts } from '../../../test-helpers/factories/post';
import { knex } from '../../../test-helpers/db';

describe('Geotag', () => {
  let user, session, geotag;

  before(async () => {
    user = await createUser();
    session = await login(user.get('username'), user.get('password'));
    geotag = await createGeotag({ name: 'SomeCity', tsv: 'some:1A city:2B' });
  });

  after(async () => {
    await user.destroy();
    await geotag.destroy();
  });

  describe('GET /api/v1/geotag/:url_name', () => {
    it('responds with geotag', async () => {
      await expect(
        {
          url: `/api/v1/geotag/${geotag.get('url_name')}`,
          method: 'GET'
        },
        'body to satisfy',
        { id: geotag.id }
      );
    });
  });

  describe('GET /api/v1/geotags', () => {
    let geotags, allGeotags;

    before(async () => {
      geotags = await createGeotags(3);
      allGeotags = sortBy([...geotags, geotag].map(geotag => geotag.attributes), 'created_at')
        .reverse();
    });

    after(async () => {
      await knex('geotags').whereIn('id', geotags.map(geotag => geotag.id)).del();
    });

    it('responds with geotags', async () => {
      await expect(
        {
          url: `/api/v1/geotags?offset=1&limit=2&sort=-created_at`,
          method: 'GET'
        },
        'body to satisfy',
        allGeotags.slice(1, 3).map(geotag => pick(geotag, 'id', 'name', 'url_name'))
      );
    });
  });

  describe('GET /api/v1/geotags/search/:query', () => {
    it('responds with matching geotags', async () => {
      await expect(
        {
          url: `/api/v1/geotags/search/som`,
          method: 'GET'
        },
        'body to satisfy',
        { geotags: [{ id: geotag.id }] }
      );
    });
  });

  describe('GET /api/v1/user/recent-geotags', () => {
    const NUM_GEOTAGS = 5;
    let posts, geotags, geotagIds;

    before(async () => {
      posts = await createPosts(Array.apply(null, Array(NUM_GEOTAGS)).map((_, i) => ({
        user_id: user.id,
        created_at: new Date(Date.UTC(2017, 10, i)),
      })));
      geotags = await createGeotags(NUM_GEOTAGS);
      geotagIds = geotags.map(geotag => geotag.id);

      await Promise.all(geotagIds.map((id, i) => (
        posts[i].geotags().attach(id)
      )));
    });

    after(async () => {
      await knex('posts').whereIn('id', posts.map(post => post.id)).del();
      await knex('geotags').whereIn('id', geotagIds).del();
    });

    it('responds with 5 recently used geotags', async () => {
      await expect(
        {
          session,
          url: `/api/v1/user/recent-geotags`,
          method: 'GET'
        },
        'body to satisfy',
        geotagIds.map(id => ({ id })).reverse()
      );
    });
  });

  describe('GET /api/v1/geotag-cloud', () => {
    const CONTINENT_CODES = [
      'EU', 'NA', 'SA', 'AF', 'AS', 'OC', 'AN'
    ];

    let geotags, posts;
    before(async () => {
      geotags = await createGeotags(CONTINENT_CODES.map(code => ({
        continent_code: code,
        post_count: 1,
      })));
      posts = await createPosts(geotags.length);

      await Promise.all(posts.map((post, i) => {
        return post.geotags().attach(geotags[i].id);
      }));
    });

    after(async () => {
      await knex('geotags').whereIn('id', geotags.map(geotag => geotag.id)).del();
      await knex('posts').whereIn('id', posts.map(post => post.id)).del();
    });

    it('responds with geotags grouped by continents', async () => {
      const tagsByContinent = geotags.map(geotag => ({
        continent_code: geotag.get('continent_code'),
        geotag_count: 1,
        geotags: [pick(geotag.attributes, 'id', 'name', 'continent_code')]
      }));

      await expect(
        {
          url: `/api/v1/geotag-cloud`,
          method: 'GET'
        },
        'body to satisfy',
        tagsByContinent
      );
    });
  });

  describe('HEAD /api/v1/geotag/:name', () => {
    it('responds with 200 if geotag exists', async () => {
      await expect(
        {
          url: `/api/v1/geotag/${geotag.get('name')}`,
          method: 'HEAD',
        },
        'to open successfully',
      );
    });

    it('responds with 404 if geotag does not exist', async () => {
      await expect(
        {
          url: `/api/v1/geotag/nonexistent`,
          method: 'HEAD',
        },
        'to open not found',
      );
    });
  });

  describe('POST /api/v1/geotag/:url_name/follow', () => {
    after(async () => {
      await user.followed_geotags().detach(geotag.id);
    });

    it('responds with geotag', async () => {
      await expect(
        {
          session,
          url: `/api/v1/geotag/${geotag.get('url_name')}/follow`,
          method: 'POST'
        },
        'body to satisfy',
        { success: true, geotag: { id: geotag.id } }
      );
    });
  });

  describe('POST /api/v1/geotag/:url_name/unfollow', () => {
    before(async () => {
      await user.followed_geotags().attach(geotag.id);
    });

    it('responds with geotag', async () => {
      await expect(
        {
          session,
          url: `/api/v1/geotag/${geotag.get('url_name')}/unfollow`,
          method: 'POST'
        },
        'body to satisfy',
        { success: true, geotag: { id: geotag.id } }
      );
    });
  });

  describe('POST /api/v1/geotag/:url_name/like', () => {
    after(async () => {
      await user.followed_geotags().detach(geotag.id);
    });

    it('responds with geotag', async () => {
      await expect(
        {
          session,
          url: `/api/v1/geotag/${geotag.get('url_name')}/like`,
          method: 'POST'
        },
        'body to satisfy',
        { success: true, geotag: { id: geotag.id } }
      );
    });
  });

  describe('POST /api/v1/geotag/:url_name/unlike', () => {
    before(async () => {
      await user.followed_geotags().attach(geotag.id);
    });

    it('responds with geotag', async () => {
      await expect(
        {
          session,
          url: `/api/v1/geotag/${geotag.get('url_name')}/unlike`,
          method: 'POST'
        },
        'body to satisfy',
        { success: true, geotag: { id: geotag.id } }
      );
    });
  });

  describe('POST /api/v1/geotag/:id', () => {
    it('only updates more.description and responds with updated geotag', async () => {
      await expect(
        {
          session,
          url: `/api/v1/geotag/${geotag.id}`,
          method: 'POST',
          body: {
            name: 'NewName',
            url_name: 'NewUrlName',
            more: {
              description: 'some description'
            }
          }
        },
        'body to satisfy',
        {
          ...pick(geotag.attributes, 'id', 'name', 'url_name'),
          more: {
            description: 'some description'
          }
        }
      );
    });
  });
});
