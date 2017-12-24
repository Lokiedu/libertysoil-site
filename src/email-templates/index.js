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
import { renderFile } from 'ejs';
import { promisify } from 'bluebird';
import moment from 'moment';
import { get } from 'lodash';

import { getUrl } from '../utils/urlGenerator';
import { API_HOST, URL_NAMES } from '../config';


const renderFileAsync = promisify(renderFile);

export async function renderResetTemplate(dateObject, username, email, confirmationLink) {
  const date = moment(dateObject).format('Do [of] MMMM YYYY');

  return await renderFileAsync(
    `${__dirname}/reset.ejs`,
    { confirmationLink, date, email, host: API_HOST, username }
  );
}

export async function renderVerificationTemplate(dateObject, username, email, confirmationLink) {
  const date = moment(dateObject).format('Do [of] MMMM YYYY');

  return await renderFileAsync(
    `${__dirname}/verification.ejs`,
    { confirmationLink, date, email, host: API_HOST, username }
  );
}

export async function renderWelcomeTemplate(dateObject, username, email) {
  const date = moment(dateObject).format('Do [of] MMMM YYYY');

  return await renderFileAsync(
    `${__dirname}/welcome.ejs`,
    { date, email, host: API_HOST, username }
  );
}

export async function renderNewCommentTemplate(comment, commentAuthor, post, postAuthor) {
  const context = {
    host: API_HOST,
    post: {
      url: getPostUrl(post),
      title: post.more.pageTitle,
      author: {
        avatarUrl: getUserAvatarUrl(postAuthor, { size: 36 })
      },
      comments: [{
        text: comment.text,
        date: moment(comment.created_at).format('Do [of] MMMM YYYY'),
        author: {
          name: getUserName(commentAuthor),
          url: getUserUrl(commentAuthor),
          avatarUrl: getUserAvatarUrl(commentAuthor, { size: 17 })
        }
      }],
    },
  };

  return await renderFileAsync(`${__dirname}/new-comment.ejs`, context);
}

export async function renderNewCommentsTemplate({ posts, since }) {
  posts = posts.map(post => ({
    id: post.id,
    title: post.more.pageTitle,
    url: getPostUrl(post),
    author: {
      avatarUrl: getUserAvatarUrl(post.user, { size: 36 }),
    },
    comments: post.comments.map(comment => ({
      text: comment.text,
      date: moment(comment.created_at).format('Do [of] MMMM YYYY'),
      author: {
        name: getUserName(comment.user),
        url: getUserUrl(comment.user),
        avatarUrl: getUserAvatarUrl(comment.user, { size: 17 }),
      }
    }))
  }));

  return await renderFileAsync(`${__dirname}/new-comments.ejs`, {
    host: API_HOST,
    posts,
    since,
  });
}

function getUserAvatarUrl(user, { size }) {
  if (get(user, 'more.avatar.url')) {
    return user.more.avatar.url;
  }

  return `http://www.gravatar.com/avatar/${user.gravatarHash}?s=${size}&r=g&d=retro`;
}

function getUserUrl(user) {
  return `${API_HOST}${getUrl(URL_NAMES.USER, { username: user.username })}`;
}

function getPostUrl(post) {
  return `${API_HOST}${getUrl(URL_NAMES.POST, { uuid: post.id })}`;
}

function getUserName(user) {
  const more = user.more;

  if (more && 'firstName' in more && 'lastName' in more) {
    return `${more.firstName} ${more.lastName}`;
  }

  return user.username;
}
