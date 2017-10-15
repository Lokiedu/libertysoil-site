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
import { createPost } from '../../../test-helpers/factories/post';
import { createUser } from '../../../test-helpers/factories/user';
import { createComment } from '../../../test-helpers/factories/comment';
import { login } from '../../../test-helpers/api';
import { bookshelf } from '../../../test-helpers/db';


const Comment = bookshelf.model('Comment');

describe('Comment', () => {
  let user, otherUser, post, comment, sessionId;

  before(async () => {
    user = await createUser();
    otherUser = await createUser();
    post = await createPost({ user_id: user.id });
    comment = await createComment({ user_id: otherUser.id, post_id: post.id });

    sessionId = await login(user.get('username'), user.get('password'));
  });

  after(async () => {
    await Promise.all([user.destroy(), otherUser.destroy(), post.destroy(), comment.destroy()]);
  });

  describe('GET /api/v1/post/:id/comments', () => {
    it('responds with post comments', async () => {
      await expect(
        {
          url: `/api/v1/post/${post.id}/comments`,
          method: 'GET',
        },
        'body to satisfy',
        [{ id: comment.id }]
      );
    });
  });

  describe('POST /api/v1/post/:id/comments', () => {
    after(async () => {
      new Comment().where({ text: 'some text' }).destroy({ require: true });
    });

    it('adds comment and responds with post comments', async () => {
      await expect(
        {
          session: sessionId,
          url: `/api/v1/post/${post.id}/comments`,
          method: 'POST',
          body: {
            text: 'some text'
          }
        },
        'body to satisfy',
        [{ id: comment.id }, { text: 'some text' }]
      );
    });
  });

  describe('POST /api/v1/post/:id/comment/:comment_id', () => {
    let myComment;

    before(async () => {
      myComment = await createComment({ post_id: post.id, user_id: user.id });
    });

    after(async () => {
      myComment.destroy();
    });

    it('fails if user does not own the post', async () => {
      await expect(
        {
          session: sessionId,
          url: `/api/v1/post/${post.id}/comment/${comment.id}`,
          method: 'POST',
          body: {
            text: 'some text'
          }
        },
        'not to open authorized'
      );
    });

    it('updates comment and responds with post comments', async () => {
      await expect(
        {
          session: sessionId,
          url: `/api/v1/post/${post.id}/comment/${myComment.id}`,
          method: 'POST',
          body: {
            text: 'new text'
          }
        },
        'body to satisfy',
        [{ id: comment.id }, { id: myComment.id, text: 'new text' }]
      );
    });
  });

  describe('DELETE /api/v1/post/:id/comment/:comment_id', () => {
    let myComment;

    before(async () => {
      myComment = await createComment({ post_id: post.id, user_id: user.id });
    });

    it('fails if user does not own the post', async () => {
      await expect(
        {
          session: sessionId,
          url: `/api/v1/post/${post.id}/comment/${comment.id}`,
          method: 'DELETE',
        },
        'not to open authorized'
      );
    });

    it('deletes comment and responds with post comments', async () => {
      await expect(
        {
          session: sessionId,
          url: `/api/v1/post/${post.id}/comment/${myComment.id}`,
          method: 'DELETE',
        },
        'body to satisfy',
        [{ id: comment.id }]
      );
    });
  });
});
