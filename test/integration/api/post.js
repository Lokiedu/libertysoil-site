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
import HashtagFactory from '../../../test-helpers/factories/hashtag';
import SchoolFactory from '../../../test-helpers/factories/school';
import GeotagFactory from '../../../test-helpers/factories/geotag';
import { createPost } from '../../../test-helpers/factories/post';
import { createUser } from '../../../test-helpers/factories/user';
import { login } from '../../../test-helpers/api';
import { knex } from '../../../test-helpers/db';


describe('Post', () => {
  describe('Not authenticated user', () => {
    let user;
    let post;

    before(async () => {
      user = await createUser();
      post = await createPost({ user_id: user.id });
    });

    after(async () => {
      await post.destroy();
      await user.destroy();
    });

    describe('/api/v1/post/:id', () => {
      describe('when post exists', () => {
        it('responds with post', async () => {
          await expect(
            { url: `/api/v1/post/${post.id}`, method: 'GET' },
            'body to satisfy',
            { id: post.id }
          );
        });
      });

      describe("when post doesn't exist", () => {
        it('responds with post', async () => {
          await expect(
            { url: `/api/v1/post/123`, method: 'GET' },
            'to open not found'
          );
        });
      });
    });

    describe('/api/v1/posts/tag/:name', async () => {
      let hashtag;

      before(async () => {
        hashtag = await post.hashtags().create(HashtagFactory.build());
      });

      after(async () => {
        await hashtag.destroy();
      });

      it('responds with hashtag posts', async () => {
        const name = encodeURIComponent(hashtag.attributes.name);

        await expect(
          { url: `/api/v1/posts/tag/${name}`, method: 'GET' },
          'to have body array length',
          1
        );
      });
    });

    describe('/api/v1/posts/school/:url_name', () => {
      let school;

      before(async () => {
        school = await post.schools().create(SchoolFactory.build());
      });

      after(async () => {
        await post.schools().detach(school);
      });

      it('responds with school posts', async () => {
        const name = encodeURIComponent(school.attributes.url_name);

        await expect(
          { url: `/api/v1/posts/school/${name}`, method: 'GET' },
          'to have body array length',
          1
        );
      });
    });

    describe('/api/v1/posts/geotag/:url_name', () => {
      let geotag;

      before(async () => {
        geotag = await post.geotags().create(GeotagFactory.build());
      });

      after(async () => {
        await post.geotags().detach(geotag);
      });

      it('responds with geotag posts', async () => {
        const name = encodeURIComponent(geotag.attributes.url_name);

        await expect(
          { url: `/api/v1/posts/geotag/${name}`, method: 'GET' },
          'to have body array length',
          1
        );
      });
    });

    describe('/api/v1/posts/liked/:name', () => {
      let postHashtagLike;

      before(async () => {
        postHashtagLike = await createPost({ type: 'hashtag_like' });
      });

      after(async () => {
        await postHashtagLike.destroy();
      });

      it('should not return hashtag_like posts from other authors', async () => {
        await expect(
          { url: `/api/v1/posts/liked/${user.get('username')}` },
          'to have body array length',
          0
        );
      });
    });
  });

  describe('Authenticated user', () => {
    let user, otherUser, sessionId;

    before(async () => {
      user = await createUser();
      sessionId = await login(user.get('username'), user.get('password'));
      otherUser = await createUser();
    });

    after(async () => {
      await user.destroy();
      await otherUser.destroy();
    });

    describe('subscriptions', () => {
      let post;

      async function countPostSubscriptions(user_id, post_id) {
        const result = await knex('post_subscriptions').where({ user_id, post_id }).count();

        return parseInt(result[0].count);
      }

      before(async () => {
        post = await createPost({ user_id: user.id });
      });

      after(async () => {
        await post.destroy();
      });

      afterEach(async () => {
        await knex('post_subscriptions').del();
      });

      describe('/api/v1/post/:id/subscribe', () => {
        it('subscribes the current user', async () => {
          await expect(
            {
              session: sessionId,
              url: `/api/v1/post/${post.id}/subscribe`,
              method: 'POST',
              body: {
                action: 'subscribe'
              }
            },
            'to open successfully'
          );

          expect(await countPostSubscriptions(user.id, post.id), 'to be', 1);
        });
      });

      describe('/api/v1/post/:id/unsubscribe', () => {
        it('unsubscribes the current user', async () => {
          await post.subscribers().attach(user.id);

          await expect(
            {
              session: sessionId,
              url: `/api/v1/post/${post.id}/unsubscribe`,
              method: 'POST',
              body: {
                action: 'unsubscribe'
              }
            },
            'to open successfully'
          );

          expect(await countPostSubscriptions(user.id, post.id), 'to be', 0);
        });
      });
    });
  });
});
