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

  describe('/api/v1/user/:id/following', () => {
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

  describe('/api/v1/user/:id/mutual-follows', () => {
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
});
