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
import { createUser } from '../../../test-helpers/factories/user';
import { createUserMessage } from '../../../test-helpers/factories/user-message';
import { login } from '../../../test-helpers/api';
import { knex, bookshelf } from '../../../test-helpers/db';


const UserMessage = bookshelf.model('UserMessage');

describe('UserMessage', () => {
  const users = [];
  let currentUser, sessionId;

  before(async () => {
    for (let i = 0; i < 3; ++i) {
      users.push(await createUser());
    }

    currentUser = await createUser();

    // currentUser user follows all users but is only followed by the first 2
    for (const user of users) {
      await currentUser.followers().attach(user.id);
    }

    await users[0].followers().attach(currentUser.id);
    await users[1].followers().attach(currentUser.id);

    sessionId = await login(currentUser.get('username'), currentUser.get('password'));
  });

  after(async () => {
    const promises = users.map(u => u.destroy({ require: true }));
    promises.push(currentUser.destroy({ require: true }));

    await Promise.all(promises);
  });

  afterEach(async () => {
    await knex('user_messages').truncate();
  });

  describe('GET /api/v1/user-messages/status', () => {
    beforeEach(async () => {
      await currentUser.save({ more: {} }, { patch: true });

      for (let i = 0; i < 2; ++i) {
        await createUserMessage({
          sender_id: users[0].id,
          receiver_id: currentUser.id,
          text: 'From users[0] to currentUser'
        });
      }

      await createUserMessage({
        sender_id: users[1].id,
        receiver_id: currentUser.id,
        text: 'From users[1] to currentUser'
      });
    });

    it('returns message count for each user and total', async () => {
      await expect(
        {
          session: sessionId,
          url: `/api/v1/user-messages/status`,
          method: 'GET'
        },
        'body to satisfy',
        {
          numUnread: 3,
          byUser: {
            [users[0].id]: { numUnread: 2 },
            [users[1].id]: { numUnread: 1 }
          }
        }
      );
    });
  });

  describe('GET /api/v1/user/:id/messages', () => {
    let messages;

    before(async () => {
      await currentUser.save({
        more: {
          userMessagesMeta: {
            byUser: {
              [users[0].id]: {
                visitedAt: new Date('1970').toJSON()
              }
            }
          }
        }
      }, { patch: true });

      await currentUser.refresh();
    });

    beforeEach(async () => {
      messages = [];

      for (let i = 0; i < 3; ++i) {
        messages.push(await createUserMessage({
          sender_id: users[0].id,
          receiver_id: currentUser.id,
          text: 'From users[0] to currentUser'
        }));
      }

      // irrelevant message
      await createUserMessage({
        sender_id: users[1].id,
        receiver_id: currentUser.id,
        text: 'From users[1] to currentUser'
      });
    });

    after(async () => {
      await currentUser.save({ more: {} }, { patch: true });
    });

    it('returns messages only between two users', async () => {
      await expect(
        {
          session: sessionId,
          url: `/api/v1/user/${users[0].id}/messages`,
          method: 'GET'
        },
        'body to satisfy',
        messages.map(m => ({ id: m.id }))
      );
    });

    it('updates visitedAt when `visit` query param is present', async () => {
      const prevDate = _.get(
        currentUser.attributes,
        ['more', 'userMessagesMeta', 'byUser', users[0].id, 'visitedAt']
      );

      await expect(
        {
          session: sessionId,
          url: `/api/v1/user/${users[0].id}/messages?visit=true`,
          method: 'GET'
        },
        'body to satisfy',
        messages.map(m => ({ id: m.id }))
      );

      await currentUser.refresh();
      const newDate = _.get(
        currentUser.attributes,
        ['more', 'userMessagesMeta', 'byUser', users[0].id, 'visitedAt']
      );

      expect(newDate, 'to be later than', prevDate);
    });
  });

  describe('POST /api/v1/user/:id/messages', () => {
    it('creates message', async () => {
      await expect(
        {
          session: sessionId,
          url: `/api/v1/user/${users[0].id}/messages`,
          method: 'POST',
          body: { text: 'Message created via POST' }
        },
        'body to satisfy',
        { text: 'Message created via POST' }
      );

      const promise = new UserMessage().where({ text: 'Message created via POST' }).fetch({ require: true });
      await expect(promise, 'to be fulfilled');
    });

    it('fails if users are not mutually followed', async () => {
      await expect(
        {
          session: sessionId,
          url: `/api/v1/user/${users[2].id}/messages`,
          method: 'POST',
          body: { text: 'Message created via POST' }
        },
        'not to open'
      );
    });
  });

  describe('POST /api/v1/user-message/:id', () => {
    let userMessage, anotherUserMessage;

    beforeEach(async () => {
      userMessage = await createUserMessage({
        sender_id: currentUser.id,
        receiver_id: users[0].id,
        text: 'From currentUser to users[0]'
      });

      anotherUserMessage = await createUserMessage({
        sender_id: users[0].id,
        receiver_id: users[1].id,
        text: 'From users[0] to users[1]'
      });
    });

    it('updates message', async () => {
      await expect(
        {
          session: sessionId,
          url: `/api/v1/user-message/${userMessage.id}`,
          method: 'POST',
          body: { text: 'Updated message' }
        },
        'body to satisfy',
        { text: 'Updated message' }
      );

      const promise = new UserMessage({ id: userMessage.id })
        .where({ text: 'Updated message' })
        .fetch({ require: true });
      await expect(promise, 'to be fulfilled');
    });

    it("fails to update another user's message", async () => {
      await expect(
        {
          session: sessionId,
          url: `/api/v1/user-message/${anotherUserMessage.id}`,
          method: 'POST',
          body: { text: 'Updated message' }
        },
        'not to open'
      );

      const promise = new UserMessage({ id: anotherUserMessage.id })
        .where({ text: 'Updated message' })
        .fetch({ require: true });

      await expect(promise, 'to be rejected');
    });
  });

  describe('DELETE /api/v1/user-message/:id', () => {
    let userMessage, anotherUserMessage;

    beforeEach(async () => {
      userMessage = await createUserMessage({
        sender_id: currentUser.id,
        receiver_id: users[0].id,
        text: 'From currentUser to users[0]'
      });

      anotherUserMessage = await createUserMessage({
        sender_id: users[0].id,
        receiver_id: users[1].id,
        text: 'From users[0] to users[1]'
      });
    });

    it('deletes message', async () => {
      await expect(
        {
          session: sessionId,
          url: `/api/v1/user-message/${userMessage.id}`,
          method: 'DELETE'
        },
        'body to satisfy',
        { success: true }
      );

      await expect(userMessage.fetch({ require: true }), 'to be rejected');
    });

    it("fails to delete another user's message", async () => {
      await expect(
        {
          session: sessionId,
          url: `/api/v1/user-message/${anotherUserMessage.id}`,
          method: 'DELETE'
        },
        'not to open'
      );
    });
  });
});
