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
import ProfilePostFactory, { createProfilePost } from '../../../test-helpers/factories/profile-post';
import { login } from '../../../test-helpers/api';


describe('ProfilePost', () => {
  let user, sessionId;
  const profilePosts = [];

  before(async () => {
    user = await createUser();
    sessionId = await login(user.get('username'), user.get('password'));

    profilePosts.push(
      await createProfilePost(user.id),
      await createProfilePost(user.id)
    );
  });

  after(async () => {
    await user.destroy();
  });

  describe('GET /api/v1/user/:username/profile-posts', () => {
    it(`returns all user's profile posts`, async () => {
      await expect(
        {
          url: `/api/v1/user/${user.get('username')}/profile-posts`,
          method: 'GET'
        },
        'body to satisfy',
        profilePosts.map(p => ({ id: p.id }))
      );
    });
  });

  describe('GET /api/v1/profile-post/:id', () => {
    it(`returns a profile post`, async () => {
      await expect(
        {
          url: `/api/v1/profile-post/${profilePosts[0].id}`,
          method: 'GET'
        },
        'body to satisfy',
        { id: profilePosts[0].id }
      );
    });
  });

  describe('POST /api/v1/profile-posts', () => {
    it(`creates and responds with a post`, async () => {
      const attrs = ProfilePostFactory.build();

      await expect(
        {
          url: `/api/v1/profile-posts`,
          method: 'POST',
          session: sessionId,
          body: attrs
        },
        'body to satisfy',
        attrs
      );
    });
  });

  describe('POST /api/v1/profile-post/:id', () => {
    it(`updates and responds with a post`, async () => {
      const attrs = ProfilePostFactory.build();

      await expect(
        {
          url: `/api/v1/profile-post/${profilePosts[0].id}`,
          method: 'POST',
          session: sessionId,
          body: {
            user_id: 'Must be ignored',
            text: attrs.text
          }
        },
        'body to satisfy',
        { text: attrs.text }
      );
    });
  });

  describe('DELETE /api/v1/profile-post/:id', () => {
    it(`deletes a post`, async () => {
      const newPost = await createProfilePost(user.id);

      await expect(
        {
          url: `/api/v1/profile-post/${newPost.id}`,
          method: 'DELETE',
          session: sessionId
        },
        'body to satisfy',
        { success: true }
      );
    });
  });
});
