/*
 This file is a part of libertysoil.org website
 Copyright (C) 2016  Loki Education (Social Enterprise)

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
/* global $dbConfig,setTimeout */
import React from 'react';
import { mount } from 'enzyme';

import { API_HOST } from '../../../src/config';
import ApiClient from '../../../src/api/client';
import { ActionsTrigger } from '../../../src/triggers';
import Login from '../../../src/components/login';
import initBookshelf from '../../../src/api/db';
import { initState } from '../../../src/store';
import expect from '../../../test-helpers/expect';
import UserFactory from '../../../test-helpers/factories/user';
import { waitForChange } from '../../../test-helpers/wait';


const bookshelf = initBookshelf($dbConfig);
const User = bookshelf.model('User');

describe('Auth page', () => {
  let user, store, client, triggers, userAttrs;

  before(async () => {
    userAttrs = UserFactory.build();
    user = await User.create(userAttrs);

    user.set('email_check_hash', null);
    await user.save(null, { method: 'update' });
    store = initState();
    client = new ApiClient(API_HOST);
    triggers = new ActionsTrigger(client, store.dispatch);
  });

  after(async () => {
    await user.destroy();
    await bookshelf.knex.raw('DELETE FROM users;');
  });

  it('Login component should work', async () => {
    const handleLogin = triggers.login.bind(null, true);
    const wrapper = mount(<Login onLoginUser={handleLogin} />);

    const newUserId = waitForChange(() =>
      store.getState().getIn(['current_user', 'id'])
    );

    wrapper.find('#loginUsername').instance()
      .value = userAttrs.username;
    wrapper.find('#loginPassword').instance()
      .value = userAttrs.password;
    wrapper.find('form').simulate('submit');

    expect(await newUserId, 'to equal', user.get('id'));
  });
});
