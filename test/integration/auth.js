/*eslint-env node, mocha */
/*global $dbConfig */
import { v4 as uuid4 } from 'uuid';

import expect from '../../test-helpers/expect';
import initBookshelf from '../../src/api/db';
import { login, POST_DEFAULT_TYPE } from '../../test-helpers/api';


let bookshelf = initBookshelf($dbConfig);

// TODO: Implement fixtures or factories.
// TODO: Use https://github.com/marak/Faker.js to generate data.
let Post = bookshelf.model('Post');
let School = bookshelf.model('School');
let User = bookshelf.model('User');

describe('routes that are unavailable for guests', function () {
  describe('when user is not logged in', function () {
    beforeEach(async function () {
      await bookshelf.knex.raw('BEGIN;');
    });

    afterEach(async function () {
      await bookshelf.knex.raw('ROLLBACK;');
    });

    let routes = [
      '/',
      '/settings',
      '/settings/password',
      '/settings/followers'
    ];

    routes.forEach(function (route) {
      it(`${route} redirects to /welcome`, async function () {
        return expect(route, 'to redirect');
      });
    });

    it('/s/:school_name/edit redirects to /welcome', async function () {
      let school = await new School({
        name: 'test',
        url_name: 'test.com'
      }).save(null, {method: 'insert'});

      return expect(`/s/${school.attributes.url_name}/edit`, 'to redirect');
    });

    it('/post/edit/:uuid redirects to /welcome', async function () {
      let post = await new Post({
        id: uuid4(),
        text: 'Test',
        type: 'test'
      }).save(null, {method: 'insert'});

      return expect(`/post/edit/${post.id}`, 'to redirect');
    });
  });
});


describe('api v1', async () => {

    describe('Authorization', () => {
    let post, user, school, unverifiedUser;

    before(async () => {
      await bookshelf.knex('users').del();
      await bookshelf.knex('posts').del();
      await bookshelf.knex('schools').del();

      user = await User.create('test', 'test', 'test@example.com');
      await user.save({'email_check_hash': ''},{require:true});

      unverifiedUser = await User.create('unverif', 'unverif', 'test-unverif@example.com');
      await unverifiedUser.save(null, {require: true});

      post = new Post({
        id: uuid4(),
        type: POST_DEFAULT_TYPE,
        user_id: user.get('id')
      });
      await post.save(null, {method: 'insert'});

      school = new School({
        id: uuid4(),
        url_name: 'test_url_name'
      });
      await school.save(null, {method: 'insert'});

    });

    after(async () => {
      await post.destroy();
      await user.destroy();
      await school.destroy();
      await unverifiedUser.destroy();
    });

    describe('When user is not logged in', () => {

      it('AUTHORIZED TO login and logins successfully', async () => {
        await expect(
          {
            url: `/api/v1/session`,
            method: 'POST',
            body: { username: 'test', password: 'test' }
          },
          'to body satisfy', { success: true}
        );
      });

      describe('Posts', async () => {

        it('AUTHORIZED TO read post', async () => {
          await expect(`/api/v1/post/${post.id}`, 'to open authorized');
        });

        it('AUTHORIZED TO read all post', async () => {
          await expect(`/api/v1/posts/all`, 'to open authorized');
        });

        it('AUTHORIZED TO read other user posts', async () => {
          await expect(`/api/v1/posts/user/${user.id}`, 'to open authorized');
        });

        it('AUTHORIZED TO read other user liked posts', async () => {
          await expect(`/api/v1/posts/liked/${user.id}`, 'to open authorized');
        });

        it('AUTHORIZED TO read other user favoured posts', async () => {
          await expect(`/api/v1/posts/favoured/${user.id}`, 'to open authorized');
        });

        it('AUTHORIZED TO read posts by tag', async () => {
          await expect(`/api/v1/posts/tag/test`, 'to open authorized');
        });

        it('AUTHORIZED TO read posts by school', async () => {
          await expect(`/api/v1/posts/school/test`, 'to open authorized');
        });

        it('AUTHORIZED TO read posts by geotag', async () => {
          await expect(`/api/v1/posts/geotag/foo`, 'to open authorized');
        });

        it('NOT AUTHORIZED TO read subscriptions', async () => {
          await expect({ url: '/api/v1/posts' }, 'not to open authorized');
        });

        it('NOT AUTHORIZED TO open liked posts page', async () => {
          await expect({ url: '/api/v1/posts/liked' }, 'not to open authorized');
        });

        it('NOT AUTHORIZED TO open favoured posts page', async () => {
          await expect({ url: '/api/v1/posts/favoured' }, 'not to open authorized');
        });

        it('NOT AUTHORIZED TO create post', async () => {
          await expect({ url: '/api/v1/posts', method: 'POST' }, 'not to open authorized');
        });

        it('NOT AUTHORIZED TO update post', async () => {
          await expect({ url: `/api/v1/post/${post.id}`, method: 'POST' }, 'not to open authorized');
        });

        it('NOT AUTHORIZED TO delete post', async () => {
          await expect({ url: `/api/v1/post/${post.id}`, method: 'DELETE' }, 'not to open authorized');
        });

        it('NOT AUTHORIZED TO like post', async () => {
          await expect({ url: `/api/v1/post/${post.id}/like`, method: 'POST' }, 'not to open authorized');
        });

        it('NOT AUTHORIZED TO unlike post', async () => {
          await expect({ url: `/api/v1/post/${post.id}/unlike`, method: 'POST' }, 'not to open authorized');
        });

        it('NOT AUTHORIZED TO fav post', async () => {
          await expect({ url: `/api/v1/post/${post.id}/fav`, method: 'POST' }, 'not to open authorized');
        });

        it('NOT AUTHORIZED TO unfav post', async () => {
          await expect({ url: `/api/v1/post/${post.id}/unfav`, method: 'POST' }, 'not to open authorized');
        });

      });

      describe('Schools', async () => {
        it('AUTHORIZED TO read schools', async () => {
          await expect(`/api/v1/schools`, 'to open authorized');
        });

        it('AUTHORIZED TO read specific school', async () => {
          await expect(`/api/v1/school/test_url_name`, 'to open authorized');
        });

        it('NOT AUTHORIZED TO update school', async () => {
          await expect({ url: `/api/v1/school/${school.id}`, method: 'POST' }, 'not to open authorized');
        });

        it('NOT AUTHORIZED TO follow school', async () => {
          await expect({ url: `/api/v1/school/${school.get('url_name')}/follow`, method: 'POST' }, 'not to open authorized');
        });

        it('NOT AUTHORIZED TO unfollow school', async () => {
          await expect({ url: `/api/v1/school/${school.get('url_name')}/unfollow`, method: 'POST' }, 'not to open authorized');
        });

      });

      describe('Countries', async () => {
        it('AUTHORIZED TO read countries', async () => {
          await expect(`/api/v1/countries`, 'to open authorized');
        });

        it('AUTHORIZED TO read specific country', async () => {
          await expect(`/api/v1/country/test`, 'to open authorized');
        });

        it('AUTHORIZED TO read specific country posts', async () => {
          await expect(`/api/v1/country/test/posts`, 'to open authorized');
        });
      });

      describe('Cities', async () => {
        it('AUTHORIZED TO read specific city', async () => {
          await expect(`/api/v1/city/test`, 'to open authorized');
        });

        it('AUTHORIZED TO read specific city posts', async () => {
          await expect(`/api/v1/city/test/posts`, 'to open authorized');
        });
      });

      describe('Users', async () => {
        it('AUTHORIZED TO read specific user', async () => {
          await expect(`/api/v1/user/test`, 'to open authorized');
        });

        it('AUTHORIZED TO read specific user', async () => {
          await expect(`/api/v1/user/test`, 'to open authorized');
        });

        it('NOT AUTHORIZED TO follow user', async () => {
          await expect({ url: `/api/v1/user/${user.get('id')}/follow`, method: 'POST' }, 'not to open authorized');
        });

        it('NOT AUTHORIZED TO unfollow user', async () => {
          await expect({ url: `/api/v1/user/${user.get('id')}/unfollow`, method: 'POST' }, 'not to open authorized');
        });

        it('NOT AUTHORIZED TO update user', async () => {
          await expect({ url: `/api/v1/user`, method: 'POST' }, 'not to open authorized');
        });

        it('NOT AUTHORIZED TO read tags', async () => {
          await expect({ url: `/api/v1/user/tags` }, 'not to open authorized');
        });

        it('NOT AUTHORIZED TO get recent geotags', async () => {
          await expect({ url: `/api/v1/user/recent-geotags` }, 'not to open authorized');
        });

      });

      describe('Tags', async () => {

        it('NOT AUTHORIZED TO get recent geotags', async () => {
          await expect({ url: `/api/v1/user/recent-geotags` }, 'not to open authorized');
        });

        it('NOT AUTHORIZED TO like tag', async () => {
          await expect({ url: `/api/v1/tag/foo/like`, method: 'POST' }, 'not to open authorized');
        });

        it('NOT AUTHORIZED TO unlike tag', async () => {
          await expect({ url: `/api/v1/tag/foo/unlike`, method: 'POST' }, 'not to open authorized');
        });

        it('NOT AUTHORIZED TO follow tag', async () => {
          await expect({ url: `/api/v1/tag/foo/follow`, method: 'POST' }, 'not to open authorized');
        });

        it('NOT AUTHORIZED TO unfollow tag', async () => {
          await expect({ url: `/api/v1/tag/foo/unfollow`, method: 'POST' }, 'not to open authorized');
        });

        it('AUTHORIZED TO read tag cloud', async () => {
          await expect({ url: `/api/v1/tag-cloud` }, 'to open authorized');
        });

        it('AUTHORIZED TO search tag', async () => {
          await expect({ url: `/api/v1/search/foo-tag` }, 'to open authorized');
        });

      });

      describe('Suggestions', async () => {
        it('NOT AUTHORIZED TO suggestions', async () => {
          await expect({ url: `/api/v1/suggestions/personalized` }, 'not to open authorized');
        });

        it('NOT AUTHORIZED TO initial suggestions', async () => {
          await expect({ url: `/api/v1/suggestions/initial` }, 'not to open authorized');
        });

      });

      it('AUTHORIZED TO verify email', async () => {
        await expect({ url: `/api/v1/user/verify/${unverifiedUser.get('email_check_hash')}` }, 'to open authorized');
      });

      it('AUTHORIZED TO change anonymous change password feature', async () => {
        await expect({ url: `/api/v1/newpassword/test` }, 'to open authorized');
      });

      it('AUTHORIZED TO use anonymous reset password feature', async () => {
        await expect({ url: `/api/v1/resetpassword` }, 'to open authorized');
      });

      it('NOT AUTHORIZED TO change password', async () => {
        await expect({ url: `/api/v1/user/password`, method: 'POST' }, 'not to open authorized');
      });

      it('NOT AUTHORIZED TO upload files', async () => {
        await expect({ url: `/api/v1/upload`, method: 'POST' }, 'not to open authorized');
      });

      it('NOT AUTHORIZED TO process image', async () => {
        await expect({ url: `/api/v1/image`, method: 'POST' }, 'not to open authorized');
      });

      it('NOT AUTHORIZED TO pickpoint', async () => {
        await expect({ url: `/api/v1/pickpoint` }, 'not to open authorized');
      });

    });

    describe('When user logged in it', () => {
      let sessionId, otherPost;

      before(async () => {
        otherPost = new Post({
          id: uuid4(),
          type: POST_DEFAULT_TYPE
        });
        await otherPost.save(null, {method: 'insert'});
        sessionId = await login('test', 'test');
      });

      after(async () => {
        otherPost.destroy();
      });

      describe('Posts', async () => {
        it('AUTHORIZED TO update own post', async () => {
          await expect({ url: `/api/v1/post/${post.id}`, session: sessionId, method: 'POST' }, 'to open authorized');
        });

        it('AUTHORIZED TO create post', async () => {
          await expect({ url: `/api/v1/posts`, session: sessionId, method: 'POST' }, 'to open authorized');
        });

        it('AUTHORIZED TO delete own post', async () => {
          await expect({ url: `/api/v1/post/${post.id}`, session: sessionId, method: 'DELETE' }, 'to open authorized');
        });

        it('AUTHORIZED TO like other post', async () => {
          await expect({ url: `/api/v1/post/${otherPost.id}/like`, session: sessionId, method: 'POST' }, 'to open authorized');
        });

        it('AUTHORIZED TO unlike other post', async () => {
          await expect({ url: `/api/v1/post/${otherPost.id}/unlike`, session: sessionId, method: 'POST' }, 'to open authorized');
        });

        it('AUTHORIZED TO fav other post', async () => {
          await expect({ url: `/api/v1/post/${otherPost.id}/fav`, session: sessionId, method: 'POST' }, 'to open authorized');
        });

        it('AUTHORIZED TO unfav other post', async () => {
          await expect({ url: `/api/v1/post/${otherPost.id}/unfav`, session: sessionId, method: 'POST' }, 'to open authorized');
        });

        it('AUTHORIZED TO read subscriptions', async () => {
          await expect({ url: `/api/v1/posts`, session: sessionId }, 'to open authorized');
        });

        it('AUTHORIZED TO read own liked posts', async () => {
          await expect({ url: `/api/v1/posts/liked`, session: sessionId }, 'to open authorized');
        });

        it('AUTHORIZED TO read own favoured posts', async () => {
          await expect({ url: `/api/v1/posts/favoured`, session: sessionId }, 'to open authorized');
        });

      });

      describe('Schools', async () => {
        it('AUTHORIZED TO follow school', async () => {
          await expect({ url: `/api/v1/school/${school.get('url_name')}/follow`, session: sessionId, method: 'POST' }, 'to open authorized');
        });

        it('AUTHORIZED TO unfollow school', async () => {
          await expect({ url: `/api/v1/school/${school.get('url_name')}/unfollow`, session: sessionId, method: 'POST' }, 'to open authorized');
        });
      });

      describe('Tags', async () => {
        it('AUTHORIZED TO like tag', async () => {
          await expect({ url: `/api/v1/tag/foo/like`, session: sessionId, method: 'POST' }, 'to open authorized');
        });

        it('AUTHORIZED TO unlike tag', async () => {
          await expect({ url: `/api/v1/tag/foo/unlike`, session: sessionId, method: 'POST' }, 'to open authorized');
        });

        it('AUTHORIZED TO follow tag', async () => {
          await expect({ url: `/api/v1/tag/foo/follow`, session: sessionId, method: 'POST' }, 'to open authorized');
        });

        it('AUTHORIZED TO unfollow tag', async () => {
          await expect({ url: `/api/v1/tag/foo/unfollow`, session: sessionId, method: 'POST' }, 'to open authorized');
        });

      });

      it('AUTHORIZED TO follow user', async () => {
        await expect({ url: `/api/v1/user/${unverifiedUser.get('username')}/follow`, session: sessionId, method: 'POST' }, 'to open authorized');
      });

      it('AUTHORIZED TO unfollow user', async () => {
        await expect({ url: `/api/v1/user/${unverifiedUser.get('username')}/unfollow`, session: sessionId, method: 'POST' }, 'to open authorized');
      });

      it('AUTHORIZED TO update his own user record', async () => {
        await expect({ url: `/api/v1/user`, session: sessionId, method: 'POST' }, 'to open authorized');
      });

      it('AUTHORIZED TO update his password', async () => {
        await expect({ url: `/api/v1/user/password`, session: sessionId, method: 'POST' }, 'to open authorized');
      });

      it('NOT AUTHORIZED TO delete other post', async () => {
        await expect({ url: `/api/v1/post/${otherPost.id}`, session: sessionId, method: 'DELETE' }, 'not to open authorized');
      });

      it('AUTHORIZED TO logout', async () => {
        await expect({ url: `/api/v1/logout`, session: sessionId }, 'to open authorized');
      });

      it('AUTHORIZED TO suggestions', async () => {
        await expect({ url: `/api/v1/suggestions/personalized`, session: sessionId }, 'to open authorized');
      });

      it('AUTHORIZED TO initial suggestions', async () => {
        await expect({ url: `/api/v1/suggestions/initial`, session: sessionId }, 'to open authorized');
      });

      it('AUTHORIZED TO upload files', async () => {
        await expect({ url: `/api/v1/upload`, method: 'POST', session: sessionId }, 'to open authorized');
      });

      it('AUTHORIZED TO process image', async () => {
        await expect({ url: `/api/v1/image`, method: 'POST', session: sessionId }, 'to open authorized');
      });

      it('AUTHORIZED TO get recent geotags', async () => {
        await expect({ url: `/api/v1/user/recent-geotags`, session: sessionId }, 'to open authorized');
      });

      // TODO: in controller http request to pickopint must be isolated in a component
      // it('AUTHORIZED TO pickpoint', async () => {
      //   await expect({ url: `/api/v1/pickpoint`, session: sessionId }, 'to open authorized');
      // });

      it('NOT AUTHORIZED TO use anonymous reset password feature', async () => {
        await expect({ url: `/api/v1/resetpassword`, session: sessionId, method: 'POST' }, 'not to open authorized');
      });

    });

  });

});
