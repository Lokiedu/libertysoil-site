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
import expect from '../../../test-helpers/expect';
import { createUser } from '../../../test-helpers/factories/user';
import { createHashtag, createHashtags } from '../../../test-helpers/factories/hashtag';
import { createPosts } from '../../../test-helpers/factories/post';
import { login } from '../../../test-helpers/api';
import { knex } from '../../../test-helpers/db';

describe('Hashtag', () => {
  let user, hashtag, session;

  before(async () => {
    user = await createUser();
    hashtag = await createHashtag({ name: 'SomeHashtag' });
    session = await login(user.get('username'), user.get('password'));
  });

  after(async () => {
    await user.destroy();
    await hashtag.destroy();
  });

  describe('GET /api/v1/tag/:name', () => {
    it('responds with hashtag', async () => {
      await expect(
        {
          url: `/api/v1/tag/${hashtag.get('name')}`,
          method: 'GET'
        },
        'body to satisfy',
        { id: hashtag.id }
      );
    });
  });

  describe('POST /api/v1/tag/:id', () => {
    it('updates hashtag', async () => {
      await expect(
        {
          session,
          url: `/api/v1/tag/${hashtag.id}`,
          method: 'POST',
          body: {
            more: { description: 'some description' }
          }
        },
        'body to satisfy',
        { more: { description: 'some description' } }
      );
    });
  });

  describe('POST /api/v1/tag/:name/follow', () => {
    after(async () => {
      await user.followed_hashtags().detach(hashtag.id);
    });

    it('responds with hashtag', async () => {
      await expect(
        {
          session,
          url: `/api/v1/tag/${hashtag.get('name')}/follow`,
          method: 'POST'
        },
        'body to satisfy',
        { success: true, hashtag: { id: hashtag.id } }
      );
    });
  });

  describe('POST /api/v1/tag/:name/unfollow', () => {
    before(async () => {
      await user.followed_hashtags().attach(hashtag.id);
    });

    it('responds with hashtag', async () => {
      await expect(
        {
          session,
          url: `/api/v1/tag/${hashtag.get('name')}/unfollow`,
          method: 'POST'
        },
        'body to satisfy',
        { success: true, hashtag: { id: hashtag.id } }
      );
    });
  });

  describe('POST /api/v1/tag/:name/like', () => {
    after(async () => {
      await user.liked_hashtags().detach(hashtag.id);
    });

    it('responds with hashtag', async () => {
      await expect(
        {
          session,
          url: `/api/v1/tag/${hashtag.get('name')}/like`,
          method: 'POST'
        },
        'body to satisfy',
        { success: true, hashtag: { id: hashtag.id } }
      );
    });
  });

  describe('POST /api/v1/tag/:name/unlike', () => {
    before(async () => {
      await user.liked_hashtags().attach(hashtag.id);
    });

    it('responds with hashtag', async () => {
      await expect(
        {
          session,
          url: `/api/v1/tag/${hashtag.get('name')}/unlike`,
          method: 'POST'
        },
        'body to satisfy',
        { success: true, hashtag: { id: hashtag.id } }
      );
    });
  });

  describe('GET /api/v1/user/recent-hashtags', () => {
    const NUM_HASHTAGS = 5;
    let posts, hashtags, hashtagIds;

    before(async () => {
      posts = await createPosts(Array.apply(null, Array(NUM_HASHTAGS)).map((_, i) => ({
        user_id: user.id,
        created_at: new Date(Date.UTC(2017, 10, i)),
      })));
      hashtags = await createHashtags(NUM_HASHTAGS);
      hashtagIds = hashtags.map(hashtag => hashtag.id);

      await Promise.all(hashtagIds.map((id, i) => (
        posts[i].hashtags().attach(id)
      )));
    });

    after(async () => {
      await knex('posts').whereIn('id', posts.map(post => post.id)).del();
      await knex('hashtags').whereIn('id', hashtagIds).del();
    });

    it('responds with 5 recently used hashtags', async () => {
      await expect(
        {
          session,
          url: `/api/v1/user/recent-hashtags`,
          method: 'GET'
        },
        'body to satisfy',
        hashtagIds.map(id => ({ id })).reverse()
      );
    });
  });

  describe('GET /api/v1/tag-cloud', () => {
    let hashtags;

    before(async () => {
      hashtags = await createHashtags([
        { post_count: 2 },
        { post_count: 1 },
        { post_count: 0 },
      ]);
    });

    after(async () => {
      await knex('hashtags').whereIn('id', hashtags.map(hashtag => hashtag.id)).del();
    });

    it('responds with hashtags sorted by post_count', async () => {
      await expect(
        {
          url: `/api/v1/tag-cloud`,
          method: 'GET'
        },
        'body to satisfy',
        [{ id: hashtags[0].id }, { id: hashtags[1].id }]
      );
    });
  });

  describe('GET /api/v1/tags/search/:query', () => {
    let hashtags;

    before(async () => {
      hashtags = await createHashtags([
        { name: 'Something One' },
        { name: 'somethingTwo' },
        { name: 'other tag' },
      ]);
    });

    after(async () => {
      await knex('hashtags').whereIn('id', hashtags.map(hashtag => hashtag.id)).del();
    });

    it('responds with matching tags', async () => {
      await expect(
        {
          url: `/api/v1/tags/search/something`,
          method: 'GET'
        },
        'body to satisfy',
        { hashtags: [{ name: 'Something One' }, { name: 'somethingTwo' }] }
      );
    });
  });
});
