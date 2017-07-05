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
import { Provider } from 'react-redux';
import { mount } from 'enzyme';
import sinon from 'sinon';

import Register, { UnwrappedRegister } from '../../../src/components/register/v1';
import { initState } from '../../../src/store';
import initBookshelf from '../../../src/api/db';
import expect from '../../../test-helpers/expect';
import UserFactory from '../../../test-helpers/factories/user';
import { waitForChange, waitForTrue } from '../../../test-helpers/wait';


const bookshelf = initBookshelf($dbConfig);
const User = bookshelf.model('User');
const noop = () => {};

describe('UnwpappedAuth page', () => {
  let user, userAttrs;

  before(async () => {
    userAttrs = UserFactory.build();
    user = await User.create(userAttrs.username, userAttrs.password, userAttrs.email);

    user.set('email_check_hash', null);
    await user.save(null, { method: 'update' });
  });

  after(async () => {
    await user.destroy();
    await bookshelf.knex.raw('DELETE FROM users;');
  });

  describe('Wrapped Register component', () => {
    let userAttrs, user, store;
    const email = 'test@example.com';

    before(async () => {
      userAttrs = UserFactory.build();
      user = await User.create(userAttrs.username, userAttrs.password, email);
    });

    beforeEach(() => {
      store = initState();
    });

    after(async () => {
      await user.destroy();
    });

    it('availableUsername should work', async () => {
      const testComponent = (
        <Register
          onRegisterUser={noop}
          onShowRegisterForm={noop}
        />
      );
      const wrapper = mount(testComponent);
      expect(wrapper.find('#registerUsername').node.value, 'to be empty');

      wrapper.find('#registerFirstName').node.value = 'John';
      wrapper.find('#registerFirstName').simulate('change');
      wrapper.find('#registerLastName').node.value = 'Smith';
      wrapper.find('#registerLastName').simulate('change');

      const suggestedUsername = waitForChange(() => wrapper.find('#registerUsername').node.value);
      expect(await suggestedUsername, 'not to be empty');
    });

    it('should check on email currently taken', async () => {
      const testComponent = (
        <Provider store={store}>
          <Register
            onRegisterUser={noop}
            onShowRegisterForm={noop}
          />
        </Provider>
      );
      const wrapper = mount(testComponent);

      const newEmailError = waitForTrue(() =>
        wrapper.find(UnwrappedRegister).props().fields.email.error === 'Email is taken'
      );

      wrapper.find('#registerEmail').simulate('change', { target: { value: email } });
      wrapper.find('#registerForm').simulate('submit');

      expect(await newEmailError, 'to be truthy');
    });

    it('Register form validation', async () => {
      const userAttrs = UserFactory.build();
      const onRegisterUser = sinon.spy();
      const testComponent = (
        <Provider store={store}>
          <Register
            onRegisterUser={onRegisterUser}
            onShowRegisterForm={noop}
          />
        </Provider>
      );

      const wrapper = mount(testComponent);
      const register = wrapper.find(UnwrappedRegister);

      const changeTextInput = async (id, value, name) => {
        wrapper.find(id).node.value = value;
        wrapper.find(id).simulate('change');
        await waitForTrue(() => !register.props().fields[name].error);
      };

      await changeTextInput('#registerUsername', userAttrs.username, 'username');
      await changeTextInput('#registerPassword', userAttrs.password, 'password');
      await changeTextInput('#registerPasswordRepeat', userAttrs.password, 'passwordRepeat');
      await changeTextInput('#registerEmail', userAttrs.email, 'email');

      wrapper.find('#registerAgree').node.checked = true;
      wrapper.find('#registerAgree').simulate('change');
      await waitForTrue(() => !register.props().fields.agree.error);
      await waitForTrue(() => register.props().form.isValid());

      wrapper.find('#registerForm').simulate('submit');
      await waitForTrue(() => register.props().form.isValid());

      return expect(onRegisterUser.calledWith(userAttrs.username, userAttrs.password, userAttrs.email, '', ''), 'to be true');
    });
  });
});
