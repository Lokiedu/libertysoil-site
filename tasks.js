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
import kueLib from 'kue';
import schedule from 'node-schedule';
import { values, isEmpty } from 'lodash';

import config from './config';
import { EmailTemplates } from './src/email-templates/index';
import { sendEmail } from './src/utils/email';
import { API_HOST, API_URL_PREFIX } from './src/config';
import dbConfig from './knexfile';  // eslint-disable-line import/default
import initBookshelf from './src/api/db';


const dbEnv = process.env.DB_ENV || 'development';
const knexConfig = dbConfig[dbEnv];
const bookshelf = initBookshelf(knexConfig);
const knex = bookshelf.knex;
const User = bookshelf.model('User');


export async function sendCommentNotifications(queue) {
  function processQueryResult(rows) {
    const postsObj = rows.reduce((acc, cur) => {
      const postId = cur.post.id;

      if (!acc[postId]) {
        acc[postId] = cur.post;
        acc[postId].comments = [];
        acc[postId].user = new User(cur.post_author).toJSON();
      }

      const comment = cur.comment;
      comment.user = new User(cur.comment_author).toJSON();
      acc[postId].comments.push(comment);

      return acc;
    }, {});

    return values(postsObj);
  }

  try {
    // TODO: Optimize for large number of users.
    const users = (await User.collection().query(qb => {
      qb.whereRaw(`more->>'comment_notifications' in ('weekly', 'daily')`);
    }).fetch()).toArray();

    for (const user of users) {
      const query = knex('post_subscriptions')
        .select(knex.raw(`
          to_json(posts.*) as post,
          to_json(comments.*) as comment,
          to_json(post_authors.*) as post_author,
          to_json(comment_authors.*) as comment_author
        `))
        .join('comments', 'comments.post_id', 'post_subscriptions.post_id')
        .join('posts', 'posts.id', 'post_subscriptions.post_id')
        .joinRaw('inner join users as post_authors on post_authors.id = posts.user_id')
        .joinRaw('inner join users as comment_authors on comment_authors.id = comments.user_id')
        .whereNot('comment_authors.id', user.id) // ignore user's own comments
        .where('post_subscriptions.user_id', user.id)
        .orderBy('comments.created_at', 'asc');

      let since;
      if (user.get('more').last_comment_notification_at) {
        since = user.get('more').last_comment_notification_at;
      } else {
        // A default `since` for an exceptional ocasion.
        since = new Date();
        since.setHours(-24);
      }

      query.where('comments.created_at', '>', since);

      const posts = processQueryResult(await query);

      if (!isEmpty(posts)) {
        queue.createQueue('new-comments-email', { posts, subscriber: { email: user.get('email') }, since });

        // update the date of the latest delivered notification
        user.save({
          more: {
            ...user.get('more'),
            last_comment_notification_at: new Date().toJSON()
          }
        }, { patch: true });
      }
    }
  } catch (e) {
    console.error('Failed sending comment notifications: ', e); // eslint-disable-line no-console
  }
}

export default function startServer(/*params*/) {
  const queue = kueLib.createQueue(config.kue);
  const emailTemplates = new EmailTemplates();

  // Every 10 minutes, update post statistics.
  schedule.scheduleJob('*/10 * * * *', async function () {
    try {
      await knex.raw(`
        UPDATE posts SET
          new_like_count = (
            SELECT count(*) FROM likes WHERE
              post_id = posts.id AND
              created_at > (current_timestamp at time zone 'UTC')::date - 30
          ),
          new_fav_count = (
            SELECT count(*) FROM favourites WHERE
              post_id = posts.id AND
              created_at > (current_timestamp at time zone 'UTC')::date - 30
          ),
          new_comment_count = (
            SELECT count(*) FROM comments WHERE
              post_id = posts.id AND
              created_at > (current_timestamp at time zone 'UTC')::date - 30
          )
      `);
      await knex.raw(`
        UPDATE posts SET
          score = new_like_count + new_fav_count + new_comment_count;
      `);

      // TODO: Use proper logger
      console.log('Post stats updated'); // eslint-disable-line no-console
    } catch (e) {
      console.error('Failed to update post stats: ', e); // eslint-disable-line no-console
    }
  });

  // Daily e-mail notification delivery
  schedule.scheduleJob('0 0 * * *', sendCommentNotifications.bind(null, queue));

  // Weekly e-mail notification delivery
  schedule.scheduleJob('0 0 * * 0', sendCommentNotifications.bind(null, queue));

  queue.on('error', (err) => {
    process.stderr.write(`${err.message}\n`);
  });

  queue.process('register-user-email', async function (job, done) {
    const {
      username,
      email,
      hash
    } = job.data;

    try {
      const html = await emailTemplates.renderVerificationTemplate(new Date(), username, email, `${API_URL_PREFIX}/user/verify/${hash}`);
      await sendEmail('Please confirm email Libertysoil.org', html, job.data.email);
      done();
    } catch (e) {
      done(e);
    }
  });

  queue.process('reset-password-email', async function (job, done) {
    try {
      const html = await emailTemplates.renderResetTemplate(new Date(), job.data.username, job.data.email, `${API_HOST}/newpassword/${job.data.hash}`);
      await sendEmail('Reset Libertysoil.org Password', html, job.data.email);
      done();
    } catch (e) {
      done(e);
    }
  });

  queue.process('verify-email', async function (job, done) {
    try {
      const html = await emailTemplates.renderWelcomeTemplate(new Date(), job.data.username, job.data.email);
      await sendEmail('Welcome to Libertysoil.org', html, job.data.email);
      done();
    } catch (e) {
      done(e);
    }
  });

  queue.process('on-comment', async function (job, done) {
    try {
      const Comment = bookshelf.model('Comment');

      const comment = await Comment
        .where({ id: job.data.commentId })
        .fetch({ require: true, withRelated: ['user', 'post', 'post.user'] });
      const commentAuthor = comment.related('user');
      const post = comment.related('post');
      const subscribers = (await post.related('subscribers').fetch())
        .map(subscriber => subscriber.attributes);
      const serializedComment = comment.toJSON();
      delete serializedComment.post;

      for (const subscriber of subscribers) {
        // Only for users with enabled per-comment notifications.
        if (subscriber.more.comment_notifications === 'on' && commentAuthor.id !== subscriber.id) {
          queue.create('new-comment-email', {
            post: {
              ...post.toJSON(),
              comments: [
                serializedComment
              ]
            },
            subscriber
          }).priority('medium').save();
        }
      }

      done();
    } catch (e) {
      done(e);
    }
  });

  queue.process('new-comment-email', async function (job, done) {
    try {
      const {
        post,
        subscriber
      } = job.data;

      const html = await emailTemplates.renderNewCommentTemplate({ post });
      await sendEmail('New Comment on LibertySoil.org', html, subscriber.email);

      done();
    } catch (e) {
      done(e);
    }
  });

  queue.process('new-comments-email', async function (job, done) {
    try {
      const {
        posts,
        since,
        subscriber
      } = job.data;

      const html = await emailTemplates.renderNewCommentsTemplate({ posts, since });
      await sendEmail('New Comments on LibertySoil.org', html, subscriber.email);

      done();
    } catch (e) {
      done(e);
    }
  });

  process.stdout.write(`Job service started\n`);
}
