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
import uuid from 'uuid';

import expect from '../../../test-helpers/expect';
import HashtagFactory, { createHashtag } from '../../../test-helpers/factories/hashtag';
import SchoolFactory, { createSchool } from '../../../test-helpers/factories/school';
import GeotagFactory, { createGeotag } from '../../../test-helpers/factories/geotag';
import { createPost, createPosts } from '../../../test-helpers/factories/post';
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

    describe('GET /api/v1/post/:id', () => {
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
            { url: `/api/v1/post/${uuid.v4()}`, method: 'GET' },
            'to open not found'
          );
        });
      });
    });

    describe('GET /api/v1/posts/user/:user', () => {
      it('responds with user posts', async () => {
        await expect(
          {
            url: `/api/v1/posts/user/${user.get('username')}`,
            method: 'GET',
          },
          'body to satisfy',
          [{ id: post.id }]
        );
      });
    });

    describe('GET /api/v1/posts/tag/:name', async () => {
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
          'body to satisfy',
          [{ id: post.id }]
        );
      });
    });

    describe('GET /api/v1/posts/school/:url_name', () => {
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
          'body to satisfy',
          [{ id: post.id }]
        );
      });
    });

    describe('GET /api/v1/posts/geotag/:url_name', () => {
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
          'body to satisfy',
          [{ id: post.id }]
        );
      });
    });

    describe('GET /api/v1/posts/liked/:username', () => {
      let postHashtagLike, post;

      beforeEach(async () => {
        postHashtagLike = await createPost({ type: 'hashtag_like' });
        post = await createPost();
        await post.likers().attach(user.id);
      });

      afterEach(async () => {
        await postHashtagLike.destroy();
        await post.destroy();
      });

      it("responds with user's liked posts and ignores hashtag_like posts", async () => {
        await expect(
          {
            url: `/api/v1/posts/liked/${user.get('username')}`,
            method: 'GET'
          },
          'body to satisfy',
          [{ id: post.id }]
        );
      });
    });

    describe('GET /api/v1/posts/favoured/:username', () => {
      const posts = [];

      beforeEach(async () => {
        posts.push(await createPost(), await createPost());
        posts[0].favourers().attach(user.id);
      });

      afterEach(async () => {
        await knex('posts').whereIn('id', posts.map(post => post.id)).del();
      });

      it("responds with user's favoured posts", async () => {
        await expect(
          {
            url: `/api/v1/posts/favoured/${user.get('username')}`,
            method: 'GET'
          },
          'body to satisfy',
          [{ id: posts[0].id }]
        );
      });
    });

    describe('GET /api/v1/post/:id/related-posts', () => {
      let posts, hashtag, school, geotag;

      before(async () => {
        posts = await createPosts(4);
        hashtag = await createHashtag();
        school = await createSchool();
        geotag = await createGeotag();

        for (let i = 0; i < 2; ++i) {
          posts[i].hashtags().attach(hashtag.id);
          posts[i].schools().attach(school.id);
          posts[i].geotags().attach(geotag.id);
        }

        posts[2].hashtags().attach(hashtag.id);
        posts[2].schools().attach(school.id);

        posts[3].hashtags().attach(hashtag.id);
      });

      after(async () => {
        await knex('posts').whereIn('id', posts.map(post => post.id)).del();
        await hashtag.destroy();
        await school.destroy();
        await geotag.destroy();
      });

      it('responds with 3 posts with common tags ordered by number of matching tags', async () => {
        await expect(
          {
            url: `/api/v1/post/${posts[0].id}/related-posts`,
            method: 'GET'
          },
          'body to satisfy',
          [{ id: posts[1].id }, { id: posts[2].id }, { id: posts[3].id }]
        );
      });
    });
  });

  describe('Authenticated user', () => {
    let user, otherUser, sessionId, otherPost;

    before(async () => {
      user = await createUser();
      sessionId = await login(user.get('username'), user.get('password'));
      otherUser = await createUser();
      otherPost = await createPost({ user_id: otherUser.id });
    });

    after(async () => {
      await user.destroy();
      await otherUser.destroy();
    });

    describe('GET /api/v1/posts', () => {
      let posts;

      beforeEach(async () => {
        await user.following().attach(otherUser.id);
        const postAttrs = [
          { user_id: otherUser.id, fully_published_at: new Date(), updated_at: new Date('2017-10-08') },
          { user_id: otherUser.id, fully_published_at: null },
        ];

        posts = await createPosts(postAttrs);
      });

      afterEach(async () => {
        await knex('posts').whereIn('id', posts.map(post => post.id)).del();
        await user.following().detach(otherUser.id);
      });

      it('responds with fully published posts of followed users', async () => {
        await expect(
          {
            session: sessionId,
            url: `/api/v1/posts`,
            method: 'GET',
          },
          'body to satisfy',
          [{ id: posts[0].id }]
        );
      });
    });

    describe('POST /api/v1/posts', () => {
      it("doesn't allow text_type to be present for non-story posts", async () => {
        await expect(
          {
            session: sessionId,
            url: `/api/v1/posts`,
            method: 'POST',
            body: {
              type: 'short_text',
              text_source: '# header',
              text_type: 'markdown',
              title: 'Title'
            }
          },
          'not to open'
        );
      });

      describe('story posts', () => {
        after(async () => {
          await knex('posts').where({ type: 'story' }).delete();
        });

        it('creates story post and processes text', async () => {
          await expect(
            {
              session: sessionId,
              url: `/api/v1/posts`,
              method: 'POST',
              body: {
                type: 'story',
                text_source: '# header',
                text_type: 'markdown',
                title: 'Title'
              }
            },
            'body to satisfy',
            {
              text_source: '# header',
              text: expect.it('to contain', '<h1>header</h1>')
            }
          );
        });

        it('extracts first image url into more.image.url', async () => {
          await expect(
            {
              session: sessionId,
              url: `/api/v1/posts`,
              method: 'POST',
              body: {
                type: 'story',
                text_source: '<div>Test</div><img src="http://test.com/test.png" />',
                text_type: 'html',
                title: 'Title'
              }
            },
            'body to satisfy',
            {
              text: expect.it('to contain', '<div>Test</div><img src="http://test.com/test.png" />'),
              more: { image: { url: 'http://test.com/test.png' } }
            }
          );
        });

        describe('when text_type is not supported or not specified', () => {
          it('returns error', async () => {
            await expect(
              {
                session: sessionId,
                url: `/api/v1/posts`,
                method: 'POST',
                body: {
                  type: 'story',
                  text_source: '# header',
                  text_type: 'invalid type',
                  title: 'Title'
                }
              },
              'not to open',
            );
          });
        });
      });
    });

    describe('POST /api/v1/post/:id', () => {
      describe('story posts', () => {
        let post;
        before(async () => {
          post = await createPost({
            user_id: user.id,
            type: 'story',
            text_type: 'markdown',
            text_source: '# initial header',
            text: '<h1>initial header</h1>'
          });
        });

        after(async () => {
          await post.destroy();
        });

        it('updates post and re-renders text', async () => {
          await expect(
            {
              session: sessionId,
              url: `/api/v1/post/${post.id}`,
              method: 'POST',
              body: {
                type: 'story',
                text_source: '# new header 1',
                text_type: 'markdown',
                title: 'Title'
              }
            },
            'body to satisfy',
            {
              text_source: '# new header 1',
              text: expect.it('to contain', '<h1>new header 1</h1>')
            }
          );
        });

        it('extracts first image url into more.image.url', async () => {
          await expect(
            {
              session: sessionId,
              url: `/api/v1/post/${post.id}`,
              method: 'POST',
              body: {
                type: 'story',
                text_source: '<div>Test</div><img src="http://test.com/test.png" />',
                text_type: 'html',
                title: 'Title'
              }
            },
            'body to satisfy',
            {
              text: expect.it('to contain', '<div>Test</div><img src="http://test.com/test.png" />'),
              more: { image: { url: 'http://test.com/test.png' } }
            }
          );
        });
      });
    });

    describe('DELETE /api/v1/post/:id', () => {
      let post;

      beforeEach(async () => {
        post = await createPost({ user_id: user.id });
      });

      it('deletes post', async () => {
        await expect(
          {
            session: sessionId,
            url: `/api/v1/post/${post.id}`,
            method: 'DELETE',
          },
          'body to satisfy',
          {
            success: true
          }
        );

        await expect(post.fetch({ require: true }), 'to be rejected');
      });
    });

    describe('GET /api/v1/posts/liked', () => {
      beforeEach(async () => {
        await otherPost.likers().attach(user.id);
      });

      afterEach(async () => {
        await otherPost.likers().detach(user.id);
      });

      it('responds with liked posts', async () => {
        await expect(
          {
            session: sessionId,
            url: '/api/v1/posts/liked',
            method: 'GET'
          },
          'body to satisfy',
          [{ id: otherPost.id }]
        );
      });
    });

    describe('GET /api/v1/posts/favoured', () => {
      beforeEach(async () => {
        await otherPost.favourers().attach(user.id);
      });

      afterEach(async () => {
        await otherPost.favourers().detach(user.id);
      });

      it('responds with favoured posts', async () => {
        await expect(
          {
            session: sessionId,
            url: '/api/v1/posts/favoured',
            method: 'GET'
          },
          'body to satisfy',
          [{ id: otherPost.id }]
        );
      });
    });

    describe('POST /api/v1/post/:id/like', () => {
      afterEach(async () => {
        await otherPost.likers().detach(user.id);
      });

      it('responds with current user likes and post likers', async () => {
        await expect(
          {
            session: sessionId,
            url: `/api/v1/post/${otherPost.id}/like`,
            method: 'POST',
          },
          'body to satisfy',
          {
            success: true,
            likes: [otherPost.id],
            likers: [{ id: user.id }],
          }
        );
      });
    });

    describe('POST /api/v1/post/:id/unlike', () => {
      beforeEach(async () => {
        await otherPost.likers().attach(user.id);
      });

      it('responds with current user likes and post likers', async () => {
        await expect(
          {
            session: sessionId,
            url: `/api/v1/post/${otherPost.id}/unlike`,
            method: 'POST',
          },
          'body to satisfy',
          {
            success: true,
            likes: [],
            likers: [],
          }
        );
      });
    });

    describe('POST /api/v1/post/:id/fav', () => {
      afterEach(async () => {
        await otherPost.favourers().detach(user.id);
      });

      it('responds with current user favourites and post favourers', async () => {
        await expect(
          {
            session: sessionId,
            url: `/api/v1/post/${otherPost.id}/fav`,
            method: 'POST',
          },
          'body to satisfy',
          {
            success: true,
            favourites: [otherPost.id],
            favourers: [{ id: user.id }],
          }
        );
      });
    });

    describe('POST /api/v1/post/:id/unfav', () => {
      beforeEach(async () => {
        await otherPost.favourers().attach(user.id);
      });

      it('responds with current user favourites and post favourers', async () => {
        await expect(
          {
            session: sessionId,
            url: `/api/v1/post/${otherPost.id}/unfav`,
            method: 'POST',
          },
          'body to satisfy',
          {
            success: true,
            favourites: [],
            favourers: [],
          }
        );
      });
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

      describe('POST /api/v1/post/:id/subscribe', () => {
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

      describe('POST /api/v1/post/:id/unsubscribe', () => {
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

      describe('GET /api/v1/post/:id/unsubscribe', () => {
        it('unsubscribes the current user', async () => {
          await post.subscribers().attach(user.id);

          await expect(
            {
              session: sessionId,
              url: `/api/v1/post/${post.id}/unsubscribe`,
              method: 'GET'
            },
            'to redirect to',
            `/post/${post.id}`
          );

          expect(await countPostSubscriptions(user.id, post.id), 'to be', 0);
        });
      });
    });

    describe('tag subscriptions', () => {
      const posts = [];

      before(async () => {
        for (let i = 0; i < 2; ++i) {
          posts.push(await createPost({ user_id: otherUser.id }));
        }

        posts.push(await createPost({ user_id: user.id }));
      });

      after(async () => {
        await Promise.all(posts.map(p => p.destroy()));
      });

      describe('GET /api/v1/posts/subscriptions/hashtag', () => {
        const hashtags = [];

        before(async () => {
          hashtags.push(await user.followed_hashtags().create({ name: 'Subscription Test 1' }));
          hashtags.push(await createHashtag({ name: 'Subscription Test 2' }));

          await posts[0].hashtags().attach(hashtags[0].id);
          await posts[1].hashtags().attach(hashtags[1].id);
          // current user's own post
          await posts[2].hashtags().attach(hashtags[0].id);
        });

        after(async () => {
          await Promise.all(hashtags.map(t => t.destroy()));
        });

        it('responds with relevant posts', async () => {
          await expect(
            {
              session: sessionId,
              url: `/api/v1/posts/subscriptions/hashtag`,
              method: 'GET'
            },
            'body to satisfy',
            [{ id: posts[0].id }]
          );
        });
      });

      describe('GET /api/v1/posts/subscriptions/school', () => {
        const schools = [];

        before(async () => {
          schools.push(await user.followed_schools().create({ name: 'Subscription Test 1' }));
          schools.push(await createSchool({ name: 'Subscription Test 2' }));

          await posts[0].schools().attach(schools[0].id);
          await posts[1].schools().attach(schools[1].id);
          // current user's own post
          await posts[2].schools().attach(schools[0].id);
        });

        after(async () => {
          await Promise.all(schools.map(t => t.destroy()));
        });

        it('responds with relevant posts', async () => {
          await expect(
            {
              session: sessionId,
              url: `/api/v1/posts/subscriptions/school`,
              method: 'GET'
            },
            'body to satisfy',
            [{ id: posts[0].id }]
          );
        });
      });

      describe('GET /api/v1/posts/subscriptions/geotag', () => {
        let followedGeotag, childGeotag, irrelevantGeotag;

        before(async () => {
          followedGeotag = await createGeotag({ type: 'Country' });
          childGeotag = await createGeotag({ type: 'City', country_id: followedGeotag.id });
          irrelevantGeotag = await createGeotag();

          await posts[0].geotags().attach(childGeotag.id);
          await posts[1].geotags().attach(irrelevantGeotag.id);
          // current user's own post
          await posts[2].geotags().attach(childGeotag.id);

          await user.followed_geotags().attach(followedGeotag.id);
        });

        after(async () => {
          await Promise.all(
            [childGeotag, followedGeotag, irrelevantGeotag].map(m => m.destroy())
          );
        });

        it('responds with relevant posts', async () => {
          await expect(
            {
              session: sessionId,
              url: `/api/v1/posts/subscriptions/geotag`,
              method: 'GET'
            },
            'body to satisfy',
            [{ id: posts[0].id }]
          );
        });
      });
    });
  });
});
