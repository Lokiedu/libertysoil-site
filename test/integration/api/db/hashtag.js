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
import HashtagFactory from '../../../../test-helpers/factories/hashtag';
import initBookshelf from '../../../../src/api/db';


const bookshelf = initBookshelf($dbConfig);
const Post = bookshelf.model('Post');
const Hashtag = bookshelf.model('Hashtag');

describe('Hashtag', () => {
  let hashtags = [];
  let posts = [];
  let postIds = [];

  before(async () => {
    for (let i = 0; i < 2; ++i) {
      const hashtag = await new Hashtag(HashtagFactory.build()).save(null, { method: 'insert' });
      hashtags.push(hashtag);
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

    for (let hashtag of hashtags) {
      hashtag.destroy();
    }
  });

  afterEach(async () => {
    for (let hashtag of hashtags) {
      await hashtag.posts().detach(postIds);
      await hashtag.save({ post_count: 0 });
    }
  });

  describe('.updatePostCounters', () => {
    it('sets post_count to a correct number of posts for each hashtag', async () => {
      for (let hashtag of hashtags) {
        await hashtag.posts().attach(postIds);
      }

      await Hashtag.updatePostCounters();

      for (let hashtag of hashtags) {
        await hashtag.refresh();
        expect(hashtag.get('post_count'), 'to equal', postIds.length);
      }
    });
  });

  describe('.updateUpdatedAt', () => {
    async function setCreatedAt(hashtagId, postId, createdAt) {
      await bookshelf.knex('hashtags_posts')
        .where('hashtag_id', hashtagId)
        .where('post_id', postId)
        .update({ created_at: createdAt });
    }

    it('sets updated_at to latest created_at from hashtags_posts', async () => {
      const hashtag = hashtags[0];
      const dates = [
        new Date(2000, 1, 1),
        new Date(2016, 1, 1)
      ];

      await hashtag.posts().attach(posts.slice(0, 2));
      await setCreatedAt(hashtag.id, posts[0].id, dates[0]);
      await setCreatedAt(hashtag.id, posts[1].id, dates[1]);

      await Hashtag.updateUpdatedAt([hashtag.get('id')]);

      await hashtag.refresh();

      expect(hashtag.get('updated_at'), 'to equal', dates[1]);
    });
  });
});