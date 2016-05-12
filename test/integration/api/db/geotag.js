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
import GeotagFactory from '../../../../test-helpers/factories/geotag';
import PostFactory from '../../../../test-helpers/factories/post';
import initBookshelf from '../../../../src/api/db';


const bookshelf = initBookshelf($dbConfig);
const Geotag = bookshelf.model('Geotag');
const Post = bookshelf.model('Post');

describe('Geotag', () => {
  let geotags = [];
  let posts = [];
  let postIds = [];

  before(async () => {
    for (let i = 0; i < 2; ++i) {
      let geotag = await new Geotag(GeotagFactory.build()).save(null, { method: 'insert' });
      geotags.push(geotag);
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

    for (let geotag of geotags) {
      geotag.destroy();
    }
  });

  afterEach(async () => {
    for (let geotag of geotags) {
      await geotag.posts().detach(postIds);
      await geotag.save({ post_count: 0 });
    }
  });

  describe('.updatePostCounters', () => {
    it('sets post_count to a correct number of posts for each geotag', async () => {
      for (let geotag of geotags) {
        await geotag.posts().attach(postIds);
      }

      await Geotag.updatePostCounters();

      for (let geotag of geotags) {
        await geotag.refresh();
        expect(geotag.get('post_count'), 'to equal', postIds.length);
      }
    });
  });
});