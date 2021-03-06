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
import { initState } from '../../../src/store';
import { ActionsTrigger } from '../../../src/triggers';
import ApiClient from '../../../src/api/client';
import { API_HOST } from '../../../src/config';
import UserFactory from '../../../test-helpers/factories/user';
import HashtagFactory from '../../../test-helpers/factories/hashtag';
import SchoolFactory from '../../../test-helpers/factories/school';
import GeotagFactory from '../../../test-helpers/factories/geotag';

const bookshelf = initBookshelf($dbConfig);
const User = bookshelf.model('User');

describe('"login" trigger', () => {
  it('adds all needed dependencies to current_user', async () => {
    const store = initState();
    const client = new ApiClient(API_HOST);
    const triggers = new ActionsTrigger(client, store.dispatch);

    const userAttrs = UserFactory.build();
    const user = await User.create(userAttrs);

    user.set('email_check_hash', null);
    await user.save(null, { method: 'update' });

    user.followed_hashtags().create(HashtagFactory.build());
    user.followed_schools().create(SchoolFactory.build());
    user.followed_geotags().create(GeotagFactory.build());

    await triggers.login(true, userAttrs.username, userAttrs.password);

    const current_user = store.getState().get('current_user');
    expect(current_user.get('followed_hashtags').toJS(), 'not to be empty');
    expect(current_user.get('followed_schools').toJS(), 'not to be empty');
    expect(current_user.get('followed_geotags').toJS(), 'not to be empty');
  });
});
