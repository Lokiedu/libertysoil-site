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

import config from './config';
import { renderVerificationTemplate, renderResetTemplate, renderWelcomeTemplate, renderNewCommentTemplate } from './src/email-templates/index';
import { sendEmail } from './src/utils/email';
import { API_HOST, API_URL_PREFIX } from './src/config';
import dbConfig from './knexfile';
import initBookshelf from './src/api/db';


const dbEnv = process.env.DB_ENV || 'development';
const knexConfig = dbConfig[dbEnv];
const bookshelf = initBookshelf(knexConfig);

const queue = kueLib.createQueue(config.kue);

queue.on('error', (err) => {
  process.stderr.write(`${err.message}\n`);
});

queue.process('register-user-email', async function(job, done) {
  const { username,
          email,
          hash } = job.data;

  try {
    const html = await renderVerificationTemplate(new Date(), username, email, `${API_URL_PREFIX}/user/verify/${hash}`);
    await sendEmail('Please confirm email Libertysoil.org', html, job.data.email);
    done();
  } catch (e) {
    done(e);
  }
});

queue.process('reset-password-email', async function(job, done) {
  try {
    const html = await renderResetTemplate(new Date(), job.data.username, job.data.email, `${API_HOST}/newpassword/${job.data.hash}`);
    await sendEmail('Reset Libertysoil.org Password', html, job.data.email);
    done();
  } catch (e) {
    done(e);
  }
});

queue.process('verify-email', async function(job, done) {
  try {
    const html = await renderWelcomeTemplate(new Date(), job.data.username, job.data.email);
    await sendEmail('Welcome to Libertysoil.org', html, job.data.email);
    done();
  } catch (e) {
    done(e);
  }
});

queue.process('on-comment', async function(job, done) {
  try {
    const Comment = bookshelf.model('Comment');

    const comment = await Comment
      .where({ id: job.data.commentId })
      .fetch({ require: true, withRelated: ['user', 'post', 'post.user'] });
    const commentAuthor = comment.related('user');
    const post = comment.related('post');
    const subscribers = await post.related('subscribers').fetch();


    if (subscribers.length > 0) {
      queue.create('new-comment-email', {
        comment: comment.attributes,
        commentAuthor: commentAuthor.attributes,
        post: post.attributes,
        subscribers: subscribers.toJSON()
      }).save();
    }

    done();
  } catch (e) {
    done(e);
  }
});

queue.process('new-comment-email', async function(job, done) {
  try {
    const {
      comment,
      commentAuthor,
      post,
      subscribers
    } = job.data;

    for (const subscriber of subscribers) {
      if (!commentAuthor.more.mute_all_posts && commentAuthor.id !== subscriber.id) {
        const html = await renderNewCommentTemplate(comment, commentAuthor, post, subscriber);
        await sendEmail('New Comment on LibertySoil.org', html, subscriber.email);
      }
    }

    done();
  } catch (e) {
    done(e);
  }
});

process.stdout.write(`Job service started\n`);
