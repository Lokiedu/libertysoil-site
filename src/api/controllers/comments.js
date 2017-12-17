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
import uuid from 'uuid';
import Joi from 'joi';

import { addToSearchIndex } from '../utils/search';
import { CommentValidator } from '../validators';

export async function getPostComments(ctx) {
  const Comment = ctx.bookshelf.model('Comment');
  const q = Comment.forge()
    .query(qb => {
      qb
        .where('post_id', '=', ctx.params.id)
        .orderBy('created_at', 'asc');
    });

  const comments = await q.fetchAll({ require: false, withRelated: ['user'] });

  ctx.body = comments;
}

export async function postComment(ctx) {
  const Comment = ctx.bookshelf.model('Comment');
  const Post = ctx.bookshelf.model('Post');

  const post = await Post.where({ id: ctx.params.id }).fetch({ require: true });

  const attributes = Joi.attempt(ctx.request.body, CommentValidator);

  const comment = new Comment({
    id: uuid.v4(),
    post_id: ctx.params.id,
    user_id: ctx.state.user,
    text: attributes.text
  });

  post.attributes.updated_at = new Date().toJSON();

  await comment.save(null, { method: 'insert' });
  await post.save(null, { method: 'update' });

  ctx.jobQueue.createJob('on-comment', { commentId: comment.id });

  await getPostComments(ctx);

  // FIXME: this should be moved to kue-task
  await addToSearchIndex(ctx.sphinx, 'Comment', comment.toJSON());
}

export async function editComment(ctx) {
  const Post = ctx.bookshelf.model('Post');
  const Comment = ctx.bookshelf.model('Comment');

  const post = await Post.where({ id: ctx.params.id }).fetch({ require: true });
  const comment = await Comment.where({
    id: ctx.params.comment_id,
    post_id: ctx.params.id
  }).fetch({ require: true });

  if (comment.get('user_id') != ctx.state.user) {
    ctx.status = 403;
  }

  const attributes = Joi.attempt(ctx.request.body, CommentValidator);

  comment.set('text', attributes.text);
  comment.set('updated_at', new Date().toJSON());
  post.attributes.updated_at = new Date().toJSON();

  await comment.save(null, { method: 'update' });
  await post.save(null, { method: 'update' });
  await getPostComments(ctx);
}

export async function removeComment(ctx) {
  const Post = ctx.bookshelf.model('Post');
  const Comment = ctx.bookshelf.model('Comment');

  const post = await Post.where({ id: ctx.params.id }).fetch({ require: true });
  const comment = await Comment.where({ id: ctx.params.comment_id, post_id: ctx.params.id }).fetch({ require: true });

  if (comment.get('user_id') != ctx.state.user) {
    ctx.status = 403;
    ctx.body = { error: 'You are not authorized' };
    return;
  }

  await comment.destroy();

  post.attributes.updated_at = new Date().toJSON();

  await post.save(null, { method: 'update' });
  await getPostComments(ctx);
}
