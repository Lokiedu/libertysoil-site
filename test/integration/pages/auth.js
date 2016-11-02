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
import { Provider } from 'react-redux';

import { API_HOST } from '../../../src/config';
import ApiClient from '../../../src/api/client';
import { ActionsTrigger } from '../../../src/triggers';
import Login from '../../../src/components/login';
import WrappedRegister, { Register } from '../../../src/components/register';
import initBookshelf from '../../../src/api/db';
import { initState } from '../../../src/store';
import expect from '../../../test-helpers/expect';
import UserFactory from '../../../test-helpers/factories/user';


const bookshelf = initBookshelf($dbConfig);
const User = bookshelf.model('User');

describe('Auth page', () => {
  let user, store, client, triggers, userAttrs;

  before(async () => {
    userAttrs = UserFactory.build();
    user = await User.create(userAttrs.username, userAttrs.password, userAttrs.email);

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

  it('Login component should work', (done) => {
    const testComponent = <Login onLoginUser={triggers.login} />;
    const wrapper = mount(testComponent);
    wrapper.find('#loginUsername').node.value = userAttrs.username;
    wrapper.find('#loginPassword').node.value = userAttrs.password;
    wrapper.find('form').simulate('submit');

    setTimeout(() => {
      expect(user.get('id'), 'to equal', store.getState().getIn(['current_user', 'id']));
      done();
    }, 200);
  });

  describe('Register component', () => {
    xit('availableUsername should work', (done) => {
      const testComponent = (
        <Register
          fields={{
            username: {},
            password: {},
            passwordRepeat: {},
            email: {},
            agree: {}
          }}
          form={{
            forceValidate: () => {},
            isValid: () => {},
            onValues: () => {},
            values: () => {}
          }}
          onRegisterUser={() => {}}
          onShowRegisterForm={() => {}}
        />
      );
      const wrapper = mount(testComponent);
      expect(wrapper.find('#registerUsername').node.value, 'to be empty');

      wrapper.find('#registerFirstName').node.value = 'test_firstname';
      wrapper.find('#registerLastName').node.value = 'test_lastname';
      wrapper.find('#registerFirstName').simulate('change');
      wrapper.find('#registerLastName').simulate('change');

      setTimeout(() => {
        expect(wrapper.find('#registerUsername').node.value, 'to be non-empty');
        done();
      }, 2000);
    });
  });

  describe('Wrapped Register component', () => {
    let userAttrs, user;
    const email = 'test@example.com';

    before(async () => {
      userAttrs = UserFactory.build();
      user = await User.create(userAttrs.username, userAttrs.password, email);
    });

    after(async () => {
      await user.destroy();
    });

    xit('should check on email currently taken', (done) => {
      const testComponent = (
        <WrappedRegister
          onRegisterUser={() => {}}
          onShowRegisterForm={() => {}}
        />
      );
      const wrapper = mount(testComponent);

      wrapper.find('#registerEmail').simulate('change', { target: { value: email } });
      wrapper.find('#registerForm').simulate('submit');

      setTimeout(() => {
        expect(wrapper.state().errors.email, 'to equal', 'Email is taken');

        done();
      }, 100);
    });

    xit('Should call "registerUser" trigger with no validation error', (done) => {
      const username = 'test2';
      const testComponent = (
        <WrappedRegister
          onRegisterUser={triggers.registerUser}
          onShowRegisterForm={() => {}}
        />
      );
      const wrapper = mount(testComponent);

      wrapper.find('#registerUsername').simulate('change', { target: { value: username } });
      wrapper.find('#registerPassword').simulate('change', { target: { value: 'test2password' } });
      wrapper.find('#registerPasswordRepeat').simulate('change', { target: { value: 'test2password' } });
      wrapper.find('#registerEmail').simulate('change', { target: { value: 'test2@example.com' } });
      wrapper.find('#registerAgree').simulate('change', { target: { value: true } });

      setTimeout(async () => {
        wrapper.find('#registerForm').simulate('submit');

        setTimeout(async () => {
          expect(await User.where({ username }).fetch({ require: true }), 'not to be empty');

          done();
        }, 2000);
      }, 2000);
    });
  });
});
