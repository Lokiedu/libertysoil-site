/* eslint-env node, mocha */
/* global $dbConfig */
import { jsdom } from 'jsdom';
import { v4 as uuid4 } from 'uuid';

import expect from '../../../test-helpers/expect';
import { login } from '../../../test-helpers/api';
import UserFactory from '../../../test-helpers/factories/user.js';
import PostFactory from '../../../test-helpers/factories/post.js';
import SchoolFactory from '../../../test-helpers/factories/school.js';
import initBookshelf from '../../../src/api/db';

let bookshelf = initBookshelf($dbConfig);
let Post = bookshelf.model('Post');
let User = bookshelf.model('User');
let School = bookshelf.model('School');


describe('School page', () => {
  describe('when user is logged in', () => {
    let user;
    let sessionId;

    before(async () => {
      await bookshelf.knex('users').del();
      user = await User.create('test', 'test', 'test@example.com');
      await user.save({'email_check_hash': ''},{require:true});

      sessionId = await login('test', 'test');
    });

    after(async () => {
      await user.destroy();
    });

    describe('Check counters', () => {

      let post, school, author;

      before(async () => {
        await bookshelf.knex('posts').del();
        await bookshelf.knex('schools').del();

        const userAttrs = UserFactory.build();

        author = await User.create(userAttrs.username, userAttrs.password, userAttrs.email);
        post = await new Post(PostFactory.build({user_id: author.id})).save(null, {method: 'insert'});
        school = await new School(SchoolFactory.build()).save(null, {method: 'insert'});

        await post.attachSchools([school.get('name')]);
      });

      after(async () => {
        await post.destroy();
        await school.destroy();
        await author.destroy();
      });

      it('displays posts counter', async () => {
        let context = await expect({ url: `/s/${school.get('url_name')}`, session: sessionId }, 'to open successfully');

        let document = jsdom(context.httpResponse.body);
        let content = await expect(document.body, 'queried for first', '#content .panel__toolbar_item-text');
        return expect(content, 'to have text', '1 posts');
      });
    });
  });
});
