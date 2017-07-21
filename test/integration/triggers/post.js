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
import { serialize } from 'cookie';

import expect from '../../../test-helpers/expect';
import { initState } from '../../../src/store';
import { ActionsTrigger } from '../../../src/triggers';
import ApiClient from '../../../src/api/client';
import { API_HOST } from '../../../src/config';
import { createUser } from '../../../test-helpers/factories/user';
import { createPost } from '../../../test-helpers/factories/post';
import HashtagFactory from '../../../test-helpers/factories/hashtag';
import SchoolFactory from '../../../test-helpers/factories/school';
import GeotagFactory from '../../../test-helpers/factories/geotag';
import { login } from '../../../test-helpers/api';


describe('subscriptions', () => {
  let user, otherUser, client;
  let triggers, store, post;

  before(async () => {
    user = await createUser();
    otherUser = await createUser();
    const sessionId = await login(user.get('username'), user.get('password'));
    const headers = {
      "cookie": serialize('connect.sid', sessionId)
    };
    client = new ApiClient(API_HOST, { headers });
  });

  after(async () => {
    await user.destroy();
    await otherUser.destroy();
  });

  beforeEach(async () => {
    store = initState();
    triggers = new ActionsTrigger(client, store.dispatch);
    post = await createPost({ user_id: otherUser.id });
  });

  afterEach(async () => {
    await post.destroy();
  });

  describe('"loadHashtagSubscriptions" trigger', () => {
    let hashtag;

    beforeEach(async () => {
      hashtag = await post.hashtags().create(HashtagFactory.build());
      await user.followed_hashtags().attach(hashtag.id);
    });

    afterEach(async () => {
      await hashtag.destroy();
    });

    it('adds posts to the posts storage and post ids to river', async () => {
      await triggers.loadHashtagSubscriptions();

      expect(
        store.getState().getIn(['tag_subscriptions', 'hashtag_subscriptions_river']).toJS(),
        'to satisfy',
        [post.id]
      );

      expect(
        store.getState().get('posts').toJS(),
        'to satisfy',
        { [post.id]: { id: post.id } }
      );
    });
  });

  describe('"loadSchoolSubscriptions" trigger', () => {
    let school;

    beforeEach(async () => {
      school = await post.schools().create(SchoolFactory.build());
      await user.followed_schools().attach(school.id);
    });

    afterEach(async () => {
      await school.destroy();
    });

    it('adds posts to the posts storage and post ids to river', async () => {
      await triggers.loadSchoolSubscriptions();

      expect(
        store.getState().getIn(['tag_subscriptions', 'school_subscriptions_river']).toJS(),
        'to satisfy',
        [post.id]
      );

      expect(
        store.getState().get('posts').toJS(),
        'to satisfy',
        { [post.id]: { id: post.id } }
      );
    });
  });

  describe('"loadGeotagSubscriptions" trigger', () => {
    let geotag;

    beforeEach(async () => {
      geotag = await post.geotags().create(GeotagFactory.build());
      await user.followed_geotags().attach(geotag.id);
    });

    afterEach(async () => {
      await geotag.destroy();
    });

    it('adds posts to the posts storage and post ids to river', async () => {
      await triggers.loadGeotagSubscriptions();

      expect(
        store.getState().getIn(['tag_subscriptions', 'geotag_subscriptions_river']).toJS(),
        'to satisfy',
        [post.id]
      );

      expect(
        store.getState().get('posts').toJS(),
        'to satisfy',
        { [post.id]: { id: post.id } }
      );
    });
  });
});

