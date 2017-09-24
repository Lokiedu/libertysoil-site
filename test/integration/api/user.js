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
import expect from '../../../test-helpers/expect';
import { createUser } from '../../../test-helpers/factories/user';
import { login } from '../../../test-helpers/api';
import { bookshelf, knex } from '../../../test-helpers/db';


const PasswordChange = bookshelf.model('PasswordChange');

describe('User', () => {
  let user, sessionId;

  before(async () => {
    user = await createUser();

    sessionId = await login(user.get('username'), user.get('password'));
  });

  after(async () => {
    await user.destroy();
  });

  it('should work', async () => {
    await expect(
      {
        session: sessionId,
        url: `/api/v1/suggestions/initial`,
        method: 'GET'
      },
      'to have body an array'
    );
  });

  describe('GET /api/v1/user/:id/following', () => {
    it('returns followed users', async () => {
      const user2 = await createUser();
      await user.following().attach(user2);

      await expect(
        {
          session: sessionId,
          url: `/api/v1/user/${user.id}/following`,
          method: 'GET'
        },
        'body to satisfy',
        [{ id: user2.id }]
      );

      await user2.destroy();
    });
  });

  describe('GET /api/v1/user/:id/mutual-follows', () => {
    it('returns mutual follows', async () => {
      const user2 = await createUser();
      const unmutualUser = await createUser();
      await user.following().attach(user2);
      await user.following().attach(unmutualUser);
      await user2.following().attach(user);

      await expect(
        {
          session: sessionId,
          url: `/api/v1/user/${user.id}/mutual-follows`,
          method: 'GET'
        },
        'body to satisfy',
        [{ id: user2.id }]
      );

      await expect(
        {
          session: sessionId,
          url: `/api/v1/user/${user2.id}/mutual-follows`,
          method: 'GET'
        },
        'body to satisfy',
        [{ id: user.id }]
      );

      await user2.destroy();
      await unmutualUser.destroy();
    });
  });

  describe('POST /api/v1/user/password', () => {
    let oldPasswordHash;

    before(() => {
      oldPasswordHash = user.get('hashed_password');
    });

    after(async () => {
      await knex('password_changes').truncate();
      await user.save({ hashed_password: oldPasswordHash }, { patch: true });
    });

    it('records password change', async () => {
      await expect(
        {
          session: sessionId,
          url: `/api/v1/user/password`,
          method: 'POST',
          body: { old_password: user.get('password'), new_password: 'new password' }
        },
        'body to satisfy',
        { success: true }
      );

      const passwordChange = new PasswordChange()
        .where({ user_id: user.id, event_type: 'change' })
        .fetch({ require: true });

      await expect(passwordChange, 'to be fulfilled');
    });
  });

  describe('POST /api/v1/newpassword/:hash', () => {
    let oldPasswordHash;

    before(() => {
      oldPasswordHash = user.get('hashed_password');
    });

    after(async () => {
      await knex('password_changes').truncate();
      await user.save({ hashed_password: oldPasswordHash }, { patch: true });
    });

    it('records password change', async () => {
      await expect(
        {
          url: `/api/v1/resetpassword`,
          method: 'POST',
          body: { email: user.get('email') }
        },
        'body to satisfy',
        { success: true }
      );

      await user.refresh();

      await expect(
        {
          url: `/api/v1/newpassword/${user.get('reset_password_hash')}`,
          method: 'POST',
          body: { password: 'new password', password_repeat: 'new password' }
        },
        'body to satisfy',
        { success: true }
      );

      const passwordChange = new PasswordChange()
        .where({ user_id: user.id, event_type: 'reset' })
        .fetch({ require: true });

      await expect(passwordChange, 'to be fulfilled');
    });
  });
});
