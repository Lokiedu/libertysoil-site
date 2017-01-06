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
import sinon from 'sinon';

import Register from '../../../src/components/register';
import initBookshelf from '../../../src/api/db';
import expect from '../../../test-helpers/expect';
import UserFactory from '../../../test-helpers/factories/user';
import { waitForChange, waitForTrue } from '../../../test-helpers/wait';


const bookshelf = initBookshelf($dbConfig);
const User = bookshelf.model('User');

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
    let userAttrs, user;
    const email = 'test@example.com';

    before(async () => {
      userAttrs = UserFactory.build();
      user = await User.create(userAttrs.username, userAttrs.password, email);
    });

    after(async () => {
      await user.destroy();
    });

    it('availableUsername should work', async () => {
      const testComponent = (
        <Register
          onRegisterUser={() => {}}
          onShowRegisterForm={() => {}}
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
        <Register
          onRegisterUser={() => {}}
          onShowRegisterForm={() => {}}
        />
      );
      const wrapper = mount(testComponent);

      const newEmailError = waitForChange(() => wrapper.state().errors.email);

      wrapper.find('#registerEmail').simulate('change', { target: { value: email } });
      wrapper.find('#registerForm').simulate('submit');

      expect(await newEmailError, 'to equal', 'Email is taken');
    });

    it('Register form validation', async () => {
      const userAttrs = UserFactory.build();
      const onRegisterUser = sinon.spy();
      const testComponent = (
        <Register
          onRegisterUser={onRegisterUser}
          onShowRegisterForm={() => {}}
        />
      );
      const wrapper = mount(testComponent);

      const changeTextInput = async (id, value, name) => {
        wrapper.find(id).node.value = value;
        wrapper.find(id).simulate('change');
        await waitForTrue(() => {
          return !wrapper.state().errors[name];
        });
      };

      await changeTextInput('#registerUsername', userAttrs.username, 'username');
      await changeTextInput('#registerPassword', userAttrs.password, 'password');
      await changeTextInput('#registerPasswordRepeat', userAttrs.password, 'passwordRepeat');
      await changeTextInput('#registerEmail', userAttrs.email, 'email');

      wrapper.find('#registerAgree').node.checked = true;
      wrapper.find('#registerAgree').simulate('change');
      await waitForTrue(() => {
        return !wrapper.state().errors.agree;
      });

      await waitForTrue(() => wrapper.state().valid);
      wrapper.find('#registerForm').simulate('submit');
      await waitForTrue(() => wrapper.state().valid);

      return expect(onRegisterUser.calledWith(userAttrs.username, userAttrs.password, userAttrs.email, '', ''), 'to be true');
    });
  });
});
