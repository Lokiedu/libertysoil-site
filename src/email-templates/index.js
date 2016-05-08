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
  let authorAvatarUrl;
  if (commentAuthor.more && commentAuthor.more.avatar && commentAuthor.more.avatar.url) {
    authorAvatarUrl = commentAuthor.more.avatar.url;
  } else {
    authorAvatarUrl = `http://www.gravatar.com/avatar/${commentAuthor.gravatarHash}?s=17&r=g&d=retro`;
  }

  let userAvatarUrl;
  if (postAuthor.more && postAuthor.more.avatar && postAuthor.more.avatar.url) {
    userAvatarUrl = postAuthor.more.avatar.url;
  } else {
    userAvatarUrl = `http://www.gravatar.com/avatar/${postAuthor.gravatarHash}?s=36&r=g&d=retro`;
  }

  const context = {
    host: API_HOST,
    comment: {
      text: comment.text,
      date: moment(comment.created_at).format('Do [of] MMMM YYYY')
    },
    commentAuthor: {
      name: `${commentAuthor.more.firstName} ${commentAuthor.more.lastName}`,
      url: API_HOST + getUrl(URL_NAMES.USER, { username: commentAuthor.username }),
      avatarUrl: authorAvatarUrl
    },
    post: {
      url: API_HOST + getUrl(URL_NAMES.POST, { uuid: comment.post_id }),
      title: post.more.pageTitle
    },
    postAuthor: {
      avatarUrl: userAvatarUrl
    }
  };

  return await renderFileAsync(`${__dirname}/new_comment.ejs`, context);
}
