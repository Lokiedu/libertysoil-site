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
import Joi from 'joi';

import { ProfilePostValidator } from '../validators';

export async function getProfilePosts(ctx) {
  const User = ctx.bookshelf.model('User');

  const user = await new User({ username: ctx.params.username }).fetch({ require: true });
  const offset = ('offset' in ctx.query) ? parseInt(ctx.query.offset, 10) : 0;
  const limit = ('limit' in ctx.query) ? parseInt(ctx.query.limit, 10) : 10;
  const posts = await user.profile_posts()
    .query(qb => {
      qb
        .offset(offset)
        .limit(limit)
        .orderBy('updated_at', 'desc');
    }).fetch();

  ctx.body = posts;
}

export async function getProfilePost(ctx) {
  const ProfilePost = ctx.bookshelf.model('ProfilePost');

  const post = await new ProfilePost({ id: ctx.params.id })
    .fetch({ require: true });

  ctx.body = post;
}

export async function createProfilePost(ctx) {
  const ProfilePost = ctx.bookshelf.model('ProfilePost');

  const attributes = Joi.attempt(ctx.request.body, ProfilePostValidator);
  attributes.user_id = ctx.state.user;

  const post = new ProfilePost(attributes);
  if (attributes.type === 'text' && !attributes.text.trim()) {
    ctx.status = 400;
    ctx.body = { error: 'Profile post\'s text is missing' };
    return;
  }

  await post.save();
  ctx.body = await post.fetch();
}

export async function updateProfilePost(ctx) {
  const ProfilePost = ctx.bookshelf.model('ProfilePost');

  const attributes = Joi.attempt(ctx.request.body, ProfilePostValidator);

  const post = await new ProfilePost()
    .where({ id: ctx.params.id, user_id: ctx.state.user })
    .fetch({ require: true });

  post.set(attributes);
  post.renderMarkdown();
  post.set('updated_at', new Date().toJSON());

  await post.save(null, { method: 'update' });
  ctx.body = await post.refresh();
}

export async function deleteProfilePost(ctx) {
  const ProfilePost = ctx.bookshelf.model('ProfilePost');

  await new ProfilePost({ id: ctx.params.id, user_id: ctx.state.user })
    .destroy({ require: true });

  ctx.body = {
    success: true
  };
}
