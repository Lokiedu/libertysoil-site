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
import HashtagFactory, { createHashtag } from '../../../test-helpers/factories/hashtag';
import SchoolFactory, { createSchool } from '../../../test-helpers/factories/school';
import GeotagFactory, { createGeotag } from '../../../test-helpers/factories/geotag';
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


    describe('POST /api/v1/posts', () => {
      it('creates a post and copies text_source into text without processing', async () => {
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
          'body to satisfy',
          {
            text_source: '# header',
            text: '# header'
          }
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


        it('updates post and re-renders text', async () => {
          await expect(
            {
              session: sessionId,
              url: `/api/v1/post/${post.id}`,
              method: 'POST',
              body: {
                type: 'story',
                text_source: '# new header 2',
                text_type: 'markdown',
                title: 'Title'
              }
            },
            'body to satisfy',
            {
              text_source: '# new header 2',
              text: expect.it('to contain', '<h1>new header 2</h1>')
            }
          );
        });
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
});
