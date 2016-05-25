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
/* global $dbConfig */
import expect from '../../../../test-helpers/expect';
import PostFactory from '../../../../test-helpers/factories/post';
import SchoolFactory from '../../../../test-helpers/factories/school';
import initBookshelf from '../../../../src/api/db';


const bookshelf = initBookshelf($dbConfig);
const Post = bookshelf.model('Post');
const School = bookshelf.model('School');

describe('School', () => {
  let schools = [];
  let posts = [];
  let postIds = [];

  before(async () => {
    for (let i = 0; i < 2; ++i) {
      const school = await new School(SchoolFactory.build()).save(null, { method: 'insert' });
      schools.push(school);
    }

    for (let i = 0; i < 3; ++i) {
      let post = await new Post(PostFactory.build()).save(null, { method: 'insert' });
      posts.push(post);
      postIds.push(post.id);
    }
  });

  after(() => {
    for (let post of posts) {
      post.destroy();
    }

    for (let school of schools) {
      school.destroy();
    }
  });

  afterEach(async () => {
    for (let school of schools) {
      await school.posts().detach(postIds);
      await school.save({ post_count: 0 });
    }
  });

  describe('.updatePostCounters', () => {
    it('sets post_count to a correct number of posts for each school', async () => {
      for (let school of schools) {
        await school.posts().attach(postIds);
      }

      await School.updatePostCounters();

      for (let school of schools) {
        await school.refresh();
        expect(school.get('post_count'), 'to equal', postIds.length);
      }
    });
  });

  describe('.updateUpdatedAt', () => {
    async function setCreatedAt(schoolId, postId, createdAt) {
      await bookshelf.knex('posts_schools')
        .where('school_id', schoolId)
        .where('post_id', postId)
        .update({ created_at: createdAt });
    }

    it('sets updated_at to latest created_at from posts_schools', async () => {
      const school = schools[0];
      const dates = [
        new Date(2000, 1, 1),
        new Date(2016, 1, 1)
      ];

      await school.posts().attach(posts.slice(0, 2));
      await setCreatedAt(school.id, posts[0].id, dates[0]);
      await setCreatedAt(school.id, posts[1].id, dates[1]);

      await School.updateUpdatedAt([school.get('id')]);

      await school.refresh();

      expect(school.get('updated_at'), 'to equal', dates[1]);
    });
  });
});