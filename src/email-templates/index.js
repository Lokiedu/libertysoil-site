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
import { readFile } from 'fs';
import path from 'path';
import { compile } from 'ejs';
import { promisify } from 'bluebird';
import moment from 'moment';
import { get } from 'lodash';
import { getUrl } from '../utils/urlGenerator';
import { API_HOST, URL_NAMES } from '../config';


const readFileAsync = promisify(readFile);

export class EmailTemplates {
  templateCache = {};

  async getTemplate(fileName) {
    let template = this.templateCache[fileName];
    if (!template) {
      const filePath = path.join(__dirname, fileName);
      const text = await readFileAsync(filePath, 'utf8');
      template = this.templateCache[fileName] = compile(text, {
        cache: true,
        filename: filePath,
      });
    }

    return template;
  }

  async renderTemplate(filename, data) {
    return (await this.getTemplate(filename))(data);
  }

  async renderResetTemplate(dateObject, username, email, confirmationLink) {
    const date = moment(dateObject).format('Do [of] MMMM YYYY');

    return await this.renderTemplate(
      `reset.ejs`,
      { confirmationLink, date, email, host: API_HOST, username }
    );
  }

  async renderVerificationTemplate(dateObject, username, email, confirmationLink) {
    const date = moment(dateObject).format('Do [of] MMMM YYYY');

    return await this.renderTemplate(
      `verification.ejs`,
      { confirmationLink, date, email, host: API_HOST, username }
    );
  }

  async renderWelcomeTemplate(dateObject, username, email) {
    const date = moment(dateObject).format('Do [of] MMMM YYYY');

    return await this.renderTemplate(
      `welcome.ejs`,
      { date, email, host: API_HOST, username }
    );
  }

  async renderNewCommentTemplate({ post }) {
    const commenent = post.comments[0];
    const context = {
      host: API_HOST,
      post: {
        url: getPostUrl(post),
        title: post.more.pageTitle,
        author: {
          avatarUrl: getUserAvatarUrl(post.user, { size: 36 })
        },
        comments: [{
          text: commenent.text,
          date: moment(commenent.created_at).format('Do [of] MMMM YYYY'),
          author: {
            name: commenent.user.fullName,
            url: getUserUrl(commenent.user),
            avatarUrl: getUserAvatarUrl(commenent.user, { size: 17 })
          }
        }],
      },
    };

    return await this.renderTemplate(`new-comment.ejs`, context);
  }

  async renderNewCommentsTemplate({ posts, since }) {
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
          name: comment.user.fullName,
          url: getUserUrl(comment.user),
          avatarUrl: getUserAvatarUrl(comment.user, { size: 17 }),
        }
      }))
    }));

    return await this.renderTemplate(
      `new-comments.ejs`,
      {
        host: API_HOST,
        since: moment(since).format('Do [of] MMMM YYYY'),
        posts,
      }
    );
  }
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
