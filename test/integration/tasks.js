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
import sinon from 'sinon';
import { fill } from 'lodash';

import expect from '../../test-helpers/expect';
import { createUsers } from '../../test-helpers/factories/user';
import { createPosts } from '../../test-helpers/factories/post';
import { createComments } from '../../test-helpers/factories/comment';
import { knex } from '../../test-helpers/db';
import { sendCommentNotifications } from '../../tasks';


describe('node-schedule tasks', () => {
  describe('sendCommentNotifications', () => {
    let posters, commenters, posts, comments;

    beforeEach(async () => {
      posters = await createUsers(
        fill(
          Array(2),
          {
            more: {
              comment_notifications: 'daily',
              last_comment_notification_at: new Date(2000, 0, 0).toJSON(),
            }
          }
        )
      );
      commenters = await createUsers(2);
      posts = await createPosts([{ user_id: posters[0].id }, { user_id: posters[1].id }]);
      comments = await createComments([
        { user_id: commenters[0].id, post_id: posts[0].id, created_at: new Date(2018, 0, 0, 1) },
        { user_id: commenters[0].id, post_id: posts[1].id, created_at: new Date(2018, 0, 0, 3) },
        { user_id: commenters[1].id, post_id: posts[0].id, created_at: new Date(2018, 0, 0, 2) },
        { user_id: commenters[1].id, post_id: posts[1].id, created_at: new Date(2018, 0, 0, 4) },
      ]);

      await posters[0].post_subscriptions().attach([posts[0].id, posts[1].id]);
      await posters[1].post_subscriptions().attach([posts[0].id, posts[1].id]);
    });

    afterEach(async () => {
      await knex('users').whereIn(
        'id',
        [posters[0].id, posters[1].id, commenters[0].id, commenters[1].id]
      ).del();
    });

    it('adds new-comments-email task to kue queue', async () => {
      const queue = {
        createQueue: sinon.stub()
      };

      await sendCommentNotifications(queue);

      expect(queue.createQueue, 'to have calls satisfying', () => {
        const subscribedPosts = [
          {
            id: posts[0].id,
            comments: [{ id: comments[0].id }, { id: comments[2].id }]
          },
          {
            id: posts[1].id,
            comments: [{ id: comments[1].id }, { id: comments[3].id }]
          }
        ];

        queue.createQueue('new-comments-email', expect.it('to satisfy', {
          subscriber: { email: posters[0].get('email') },
          posts: subscribedPosts,
        }));
        queue.createQueue('new-comments-email', expect.it('to satisfy', {
          subscriber: { email: posters[1].get('email') },
          posts: subscribedPosts,
        }));
      });
    });


    it('updates users.more.last_comment_notification_at', async () => {
      const queue = {
        createQueue: () => {}
      };

      const dateJustBefore = new Date();
      dateJustBefore.setHours(-1);

      await sendCommentNotifications(queue);
      await posters[0].refresh();
      await posters[1].refresh();

      expect(new Date(posters[0].get('more').last_comment_notification_at), 'to be same or after', dateJustBefore);
      expect(new Date(posters[1].get('more').last_comment_notification_at), 'to be same or after', dateJustBefore);
    });
  });
});
