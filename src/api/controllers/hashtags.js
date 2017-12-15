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
import _ from 'lodash';
import uuid from 'uuid';
import Joi from 'joi';

import { HashtagValidator } from '../validators';

export async function getHashtag(ctx) {
  const Hashtag = ctx.bookshelf.model('Hashtag');

  const hashtag = await Hashtag
    .forge()
    .where('name', ctx.params.name)
    .fetch({ require: true });

  ctx.body = hashtag;
}

export async function updateHashtag(ctx) {
  const Hashtag = ctx.bookshelf.model('Hashtag');

  let more = Joi.attempt(ctx.request.body, HashtagValidator).more;
  const hashtag = await Hashtag.where({ id: ctx.params.id }).fetch({ require: true });

  more.last_editor = ctx.state.user;
  more = _.extend(hashtag.get('more'), more);

  hashtag.set('more', more);
  await hashtag.save(null, { method: 'update' });

  ctx.body = hashtag;
}

export async function followHashtag(ctx) {
  const User = ctx.bookshelf.model('User');
  const Hashtag = ctx.bookshelf.model('Hashtag');

  const currentUser = await User.forge().where('id', ctx.state.user).fetch();
  const hashtag = await Hashtag.forge().where('name', ctx.params.name).fetch();

  await currentUser.followHashtag(hashtag.id);

  ctx.body = { success: true, hashtag };
}

export async function unfollowHashtag(ctx) {
  const User = ctx.bookshelf.model('User');
  const Hashtag = ctx.bookshelf.model('Hashtag');

  const currentUser = await User.forge().where('id', ctx.state.user).fetch();
  const hashtag = await Hashtag.forge().where('name', ctx.params.name).fetch();

  await currentUser.unfollowHashtag(hashtag.id);

  ctx.body = { success: true, hashtag };
}

export async function likeHashtag(ctx) {
  const User = ctx.bookshelf.model('User');
  const Hashtag = ctx.bookshelf.model('Hashtag');
  const Post = ctx.bookshelf.model('Post');

  const user = await User.where({ id: ctx.state.user }).fetch({ require: true, withRelated: ['liked_hashtags'] });
  const hashtag = await Hashtag.where({ name: ctx.params.name }).fetch({ require: true });

  await user.liked_hashtags().detach(hashtag);
  await user.liked_hashtags().attach(hashtag);

  await new Post({
    id: uuid.v4(),
    fully_published_at: new Date().toJSON(),
    type: 'hashtag_like',
    liked_hashtag_id: hashtag.id,
    user_id: user.id
  }).save(null, { method: 'insert' });

  ctx.body = { success: true, hashtag };
}

export async function unlikeHashtag(ctx) {
  const User = ctx.bookshelf.model('User');
  const Hashtag = ctx.bookshelf.model('Hashtag');
  const Post = ctx.bookshelf.model('Post');

  const user = await User.where({ id: ctx.state.user }).fetch({ require: true, withRelated: ['liked_hashtags'] });
  const hashtag = await Hashtag.where({ name: ctx.params.name }).fetch({ require: true });

  await user.liked_hashtags().detach(hashtag);

  await Post
    .where({
      user_id: user.id,
      liked_hashtag_id: hashtag.id
    })
    .destroy();

  ctx.body = { success: true, hashtag };
}

export async function getUserRecentHashtags(ctx) {
  const Hashtag = ctx.bookshelf.model('Hashtag');

  const hashtags = await Hashtag.getRecentlyUsed()
    .query(qb => {
      qb
        .where('posts.user_id', ctx.state.user)
        .limit(5);
    })
    .fetch();

  ctx.body = hashtags;
}

/**
 * Returns 50 most popular hashtags sorted by post count.
 * Each hashtag in response contains post_count.
 */
export async function getHashtagCloud(ctx) {
  const Hashtag = ctx.bookshelf.model('Hashtag');

  const hashtags = await Hashtag
    .collection()
    .query(qb => {
      qb
        .where('post_count', '>', '0')
        .orderByRaw('post_count DESC, name ASC');
    })
    .fetch({ require: true });

  ctx.body = hashtags;
}

export async function searchHashtags(ctx) {
  const hashtags = await getSimilarHashtags(ctx.bookshelf, ctx.params.query);
  ctx.body = { hashtags };
}

// Helpers

async function getSimilarHashtags(bookshelf, query) {
  const Hashtag = bookshelf.model('Hashtag');

  const hashtags = await Hashtag.collection().query(function (qb) {
    qb
      .where('name', 'ILIKE', `${query}%`)
      .limit(10);
  }).fetch();

  return hashtags;
}
