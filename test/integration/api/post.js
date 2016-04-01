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
import expect from '../../../test-helpers/expect';
import initBookshelf from '../../../src/api/db';
import HashtagFactory from '../../../test-helpers/factories/hashtag';
import SchoolFactory from '../../../test-helpers/factories/school';
import GeotagFactory from '../../../test-helpers/factories/geotag';
import PostFactory from '../../../test-helpers/factories/post';
import UserFactory from '../../../test-helpers/factories/user';


const bookshelf = initBookshelf($dbConfig);
const Post = bookshelf.model('Post');
const User = bookshelf.model('User');
const Hashtag = bookshelf.model('Hashtag');
const School = bookshelf.model('School');
const Geotag = bookshelf.model('Geotag');

describe('Post', () => {
  let user;
  let post;

  before(async () => {
    let userAttrs = UserFactory.build();
    user = await User.create(userAttrs.username, userAttrs.password, userAttrs.email);
    post = await new Post(PostFactory.build({user_id: user.id})).save(null, {method: 'insert'});
  });

  after(async () => {
    await post.destroy();
    await user.destroy();
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
        {url: `/api/v1/posts/tag/${name}`, method: 'GET'},
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
        {url: `/api/v1/posts/school/${name}`, method: 'GET'},
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
        {url: `/api/v1/posts/geotag/${name}`, method: 'GET'},
        'to have body array length',
        1
      );
    });
  });
});
