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
import _ from 'lodash';

import expect from '../../../test-helpers/expect';
import { createUser, createUsers } from '../../../test-helpers/factories/user';
import { createPosts } from '../../../test-helpers/factories/post';
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
      'to respond with array'
    );
  });

  describe('GET /api/v1/users/:username', () => {
    it('responds with user', async () => {
      await expect(
        {
          session: sessionId,
          url: `/api/v1/user/${user.get('username')}`,
          method: 'GET'
        },
        'body to satisfy',
        { id: user.id }
      );
    });
  });

  describe('POST /api/v1/user', () => {
    it('responds with user on success', async () => {
      await expect(
        {
          session: sessionId,
          url: '/api/v1/user',
          method: 'POST',
          body: {
            more: { bio: 'Test user bio' }
          },
        },
        'body to satisfy',
        {
          user: {
            more: { bio: 'Test user bio' }
          }
        }
      );
    });
  });

  describe('POST /api/v1/users', () => {
    afterEach(async () => {
      await knex('users').where('username', 'newjohndoe').del();
    });

    it('responds with new user', async () => {
      const attrs = {
        username: 'newjohndoe',
        email: 'newjohndoe@fake.mail',
        password: 'password',
      };

      await expect(
        {
          url: '/api/v1/users',
          method: 'POST',
          body: attrs,
        },
        'body to satisfy',
        {
          user: { username: attrs.username }
        }
      );
    });
  });

  describe('POST /api/v1/session', () => {
    // TODO: Check if session was created
    it('responds with user', async () => {
      await expect(
        {
          url: '/api/v1/session',
          method: 'POST',
          body: {
            username: user.get('username'),
            password: user.get('password'),
          },
        },
        'body to satisfy',
        {
          user: { username: user.get('username') }
        }
      );
    });
  });

  describe('HEAD /user/email/:email', () => {
    it('responds with 200 if email is found', async () => {
      await expect(
        {
          url: `/api/v1/user/email/${user.get('email')}`,
          method: 'HEAD',
        },
        'to open successfully',
      );
    });

    it('responds with 404 if email is not found', async () => {
      await expect(
        {
          url: `/api/v1/user/email/somemail@incorrect.mail`,
          method: 'HEAD',
        },
        'to open not found',
      );
    });
  });

  describe('HEAD /api/v1/user/:username', () => {
    it('responds with 200 if user is found', async () => {
      await expect(
        {
          url: `/api/v1/user/${user.get('username')}`,
          method: 'HEAD',
        },
        'to open successfully',
      );
    });

    it('responds with 404 if user is not found', async () => {
      await expect(
        {
          url: `/api/v1/user/nonexistent`,
          method: 'HEAD',
        },
        'to open not found',
      );
    });
  });

  describe('GET /user/available-username/:username', () => {
    it('responds with same username if it is not in use', async () => {
      await expect(
        {
          session: sessionId,
          url: `/api/v1/user/available-username/SomeAvailableUsername`,
          method: 'GET'
        },
        'body to satisfy',
        { username: 'SomeAvailableUsername' }
      );
    });

    it('responds with different username if it is in use', async () => {
      await expect(
        {
          session: sessionId,
          url: `/api/v1/user/available-username/${user.get('username')}`,
          method: 'GET'
        },
        'body to satisfy',
        { username: expect.it('not to equal', user.get('username')) }
      );
    });
  });

  describe('GET /api/v1/user/verify/:hash', () => {
    let unverifiedUser;

    beforeEach(async () => {
      unverifiedUser = await createUser({ email_check_hash: 'somehash' });
    });

    afterEach(async () => {
      await unverifiedUser.destroy();
    });

    it('removes hash from user on success', async () => {
      await expect(
        {
          session: sessionId,
          url: `/api/v1/user/verify/somehash`,
          method: 'GET'
        },
        'to redirect to',
        '/'
      );

      await unverifiedUser.refresh();

      await expect(unverifiedUser.get('email_check_hash'), 'to be falsy');
    });
  });

  describe('POST /api/v1/resetpassword', () => {
    it('does not allow authenticated users', async () => {
      await expect(
        {
          session: sessionId,
          url: `/api/v1/resetpassword`,
          method: 'POST'
        },
        'to respond with status',
        403
      );
    });

    it('responds with success if user does not exist', async () => {
      await expect(
        {
          url: `/api/v1/resetpassword`,
          method: 'POST',
          body: {
            email: 'nonexistent@user.mail'
          }
        },
        'to open successfully'
      );
    });
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

  describe('GET /api/v1/suggestions/personalized', () => {
    const NUM_ALL_USERS = 10;
    const NUM_RETURNED_USERS = 6;

    let users;

    beforeEach(async () => {
      users = await createUsers(NUM_ALL_USERS);

      for (let i = 0; i < NUM_RETURNED_USERS; ++i) {
        const attrs = Array.apply(null, Array(NUM_RETURNED_USERS - i))
          .map(() => ({ user_id: users[i].id }));
        await createPosts(attrs);
      }

      // ignored user (must be ignored)
      await user.ignored_users().attach(users[6]);
      const ignoredUserPostAttrs = Array.apply(null, Array(2))
        .map(() => ({ user_id: users[6].id }));
      createPosts(ignoredUserPostAttrs);

      // followed user (must be ignored)
      await user.following().attach(users[7]);
      const followedUserPostAttrs = Array.apply(null, Array(2))
        .map(() => ({ user_id: users[7].id }));
      createPosts(followedUserPostAttrs);
    });

    afterEach(async () => {
      await knex('users').whereIn('id', users.map(u => u.id)).del();
    });

    it('responds with 6 user suggestions sorted by number of posts', async () => {
      await expect(
        {
          session: sessionId,
          url: `/api/v1/suggestions/personalized`,
          method: 'GET'
        },
        'body to satisfy',
        users.slice(0, NUM_RETURNED_USERS).map(u => _.pick(u.attributes, 'id', 'username'))
      );
    });
  });

  describe('GET /api/v1/suggestions/initial', () => {
    const NUM_USERS = 20;

    let users;

    beforeEach(async () => {
      users = await createUsers(NUM_USERS);

      for (let i = 0; i < NUM_USERS; ++i) {
        const attrs = Array.apply(null, Array(NUM_USERS - i))
          .map(() => ({ user_id: users[i].id }));
        await createPosts(attrs);
      }
    });

    afterEach(async () => {
      await knex('users').whereIn('id', users.map(u => u.id)).del();
    });

    it('responds with 20 user suggestions sorted by number of posts', async () => {
      await expect(
        {
          session: sessionId,
          url: `/api/v1/suggestions/initial`,
          method: 'GET'
        },
        'body to satisfy',
        users.map(u => _.pick(u.attributes, 'id', 'username'))
      );
    });
  });

  describe('POST /api/v1/user/:username/follow', () => {
    let otherUser;

    beforeEach(async () => {
      otherUser = await createUser();
    });

    afterEach(async () => {
      await otherUser.destroy();
    });

    it('responds with both users', async () => {
      await expect(
        {
          session: sessionId,
          url: `/api/v1/user/${otherUser.get('username')}/follow`,
          method: 'POST'
        },
        'body to satisfy',
        {
          success: true,
          user1: _.pick(user.attributes, 'id'),
          user2: _.pick(otherUser.attributes, 'id')
        }
      );
    });
  });

  describe('POST /api/v1/user/:username/unfollow', () => {
    let otherUser;

    beforeEach(async () => {
      otherUser = await createUser();
      await user.following().attach(otherUser.id);
    });

    afterEach(async () => {
      await otherUser.destroy();
    });

    it('responds with both users', async () => {
      await expect(
        {
          session: sessionId,
          url: `/api/v1/user/${otherUser.get('username')}/unfollow`,
          method: 'POST'
        },
        'body to satisfy',
        {
          success: true,
          user1: _.pick(user.attributes, 'id'),
          user2: _.pick(otherUser.attributes, 'id')
        }
      );
    });
  });

  describe('POST /api/v1/user/:username/ignore', () => {
    let otherUser;

    beforeEach(async () => {
      otherUser = await createUser();
    });

    afterEach(async () => {
      await otherUser.destroy();
    });

    it('succeeds', async () => {
      await expect(
        {
          session: sessionId,
          url: `/api/v1/user/${otherUser.get('username')}/ignore`,
          method: 'POST'
        },
        'body to satisfy',
        {
          success: true
        }
      );
    });
  });

  describe('POST /api/v1/logout', () => {
    afterEach(async () => {
      sessionId = await login(user.get('username'), user.get('password'));
    });

    it('redirects to /', async () => {
      await expect(
        {
          session: sessionId,
          url: `/api/v1/logout`,
          method: 'POST'
        },
        'to redirect to',
        '/'
      );
    });
  });
});
