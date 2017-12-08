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
import Joi from 'joi';

import * as PostUtils from '../utils/posts';
import { seq } from '../../utils/lang';
import {
  applyFieldsQuery, applyLimitQuery, applyOffsetQuery, applySortQuery, applyDateRangeQuery
} from '../utils/filters';
import { POST_RELATIONS, POST_PUBLIC_COLUMNS, POST_DEFAULT_COLUMNS } from '../consts';
import { PostValidator } from '../validators';

export async function getPost(ctx) {
  const Post = ctx.bookshelf.model('Post');

  let post = await Post.where({ id: ctx.params.id }).fetch({ require: true, withRelated: POST_RELATIONS });

  post = seq([
    PostUtils.filterUsersReactions.forUser(ctx.state.user),
    PostUtils.serialize
  ])(post);
  ctx.body = post;
}

export async function subscriptions(ctx) {
  const uid = ctx.state.user;
  const Post = ctx.bookshelf.model('Post');

  const offset = ('offset' in ctx.query) ? parseInt(ctx.query.offset, 10) : 0;

  const q = Post.forge()
    .query(qb => {
      qb
        .leftJoin('followers', 'followers.following_user_id', 'posts.user_id')
        .whereRaw('(followers.user_id = ? OR posts.user_id = ?)', [uid, uid])  // followed posts
        .whereRaw('(posts.fully_published_at IS NOT NULL OR posts.user_id = ?)', [uid]) // only major and own posts
        .orderBy('posts.updated_at', 'desc')
        .groupBy('posts.id')
        .limit(5)
        .offset(offset);

      applyFieldsQuery(qb, ctx.query, {
        allowedFileds: POST_PUBLIC_COLUMNS,
        defaultFileds: POST_DEFAULT_COLUMNS,
        table: 'posts'
      });
    });

  let posts = await q.fetchAll({ require: false, withRelated: POST_RELATIONS });
  posts = await preparePosts(ctx, posts);

  ctx.body = posts;
}

export async function hashtagSubscriptions(ctx) {
  const Post = ctx.bookshelf.model('Post');

  const hashtags = await ctx.bookshelf.knex('followed_hashtags_users')
    .where('user_id', ctx.state.user);
  const hashtagIds = hashtags.map(t => t.hashtag_id);

  const q = Post.collection()
    .query(qb => {
      qb
        .join('hashtags_posts', 'hashtags_posts.post_id', 'posts.id')
        .whereNot('user_id', ctx.state.user)
        .whereIn('hashtags_posts.hashtag_id', hashtagIds)
        .orderBy('posts.updated_at', 'desc')
        .groupBy('posts.id');

      applyLimitQuery(qb, ctx.query, { defaultValue: 5 });
      applyOffsetQuery(qb, ctx.query);
      applySortQuery(qb, ctx.query, { defaultValue: '-updated_at' });
    });

  let posts = await q.fetch({ withRelated: POST_RELATIONS });
  posts = await preparePosts(ctx, posts);

  ctx.body = posts;
}

export async function schoolSubscriptions(ctx) {
  const Post = ctx.bookshelf.model('Post');

  const schools = await ctx.bookshelf.knex('followed_schools_users')
    .where('user_id', ctx.state.user);
  const schoolIds = schools.map(t => t.school_id);

  const q = Post.collection()
    .query(qb => {
      qb
        .join('posts_schools', 'posts_schools.post_id', 'posts.id')
        .whereNot('user_id', ctx.state.user)
        .whereIn('posts_schools.school_id', schoolIds)
        .orderBy('posts.updated_at', 'desc')
        .groupBy('posts.id');

      applyLimitQuery(qb, ctx.query, { defaultValue: 5 });
      applyOffsetQuery(qb, ctx.query);
      applySortQuery(qb, ctx.query, { defaultValue: '-updated_at' });
    });

  let posts = await q.fetch({ withRelated: POST_RELATIONS });
  posts = await preparePosts(ctx, posts);

  ctx.body = posts;
}

export async function geotagSubscriptions(ctx) {
  const Post = ctx.bookshelf.model('Post');

  const geotags = await ctx.bookshelf.knex('followed_geotags_users')
    .where('user_id', ctx.state.user);
  const geotagIds = geotags.map(t => t.geotag_id);

  // When it gets to slow we might try to add parent ids to geotags_posts instead of joining geotags.
  const q = Post.collection()
    .query(qb => {
      qb
        .join('geotags_posts', 'geotags_posts.post_id', 'posts.id')
        .join('geotags', 'geotags.id', 'geotags_posts.geotag_id')
        .whereNot('user_id', ctx.state.user)
        .where((qb) => {
          qb
            .whereIn('geotags.id', geotagIds)
            .orWhereIn('geotags.continent_id', geotagIds)
            .orWhereIn('geotags.country_id', geotagIds)
            .orWhereIn('geotags.admin1_id', geotagIds);
        })
        .orderBy('posts.updated_at', 'desc')
        .groupBy('posts.id');

      applyLimitQuery(qb, ctx.query, { defaultValue: 5 });
      applyOffsetQuery(qb, ctx.query);
      applySortQuery(qb, ctx.query, { defaultValue: '-updated_at' });
    });

  let posts = await q.fetch({ withRelated: POST_RELATIONS });
  posts = await preparePosts(ctx, posts);

  ctx.body = posts;
}

export async function createPost(ctx) {
  const Post = ctx.bookshelf.model('Post');

  const attributes = Joi.attempt(ctx.request.body, PostValidator);

  const post = await Post.create({
    ...attributes,
    user_id: ctx.state.user
  });
  await post.refresh({ require: true, withRelated: POST_RELATIONS });

  ctx.body = PostUtils.serialize(post);
}

export async function updatePost(ctx) {
  const Post = ctx.bookshelf.model('Post');

  const post = await Post.where({ id: ctx.params.id, user_id: ctx.state.user }).fetch({ require: true, withRelated: ['hashtags'] });
  await post.update(ctx.request.body);
  await post.refresh({ require: true, withRelated: POST_RELATIONS });

  ctx.body = PostUtils.serialize(post);
}

export async function removePost(ctx) {
  const Post = ctx.bookshelf.model('Post');

  const post = await Post.where({ id: ctx.params.id }).fetch({ require: true });

  if (post.get('user_id') != ctx.state.user) {
    ctx.status = 403;
    ctx.body = { error: 'api.errors.forbidden' };
    return;
  }

  // reset post counters on attached tags and then destroy
  await post.detachAllTags();
  post.destroy();

  ctx.status = 200;
  ctx.body = { success: true };
}

/**
 * Subscribes the current user to the specified post.
 * If subscribed, the current user recieves notifications about new comments on the post.
 */
export async function subscribeToPost(ctx) {
  const Post = ctx.bookshelf.model('Post');

  const post = await Post.where({ id: ctx.params.id }).fetch({ require: true });
  await post.subscribers().attach(ctx.state.user);

  ctx.status = 200;
  ctx.body = { success: true };
}

export async function unsubscribeFromPost(ctx) {
  const Post = ctx.bookshelf.model('Post');

  const post = await Post.where({ id: ctx.params.id }).fetch({ require: true });
  await post.subscribers().detach(ctx.state.user);

  ctx.status = 200;
  ctx.body = { success: true };
}

export async function getUnsubscribeFromPost(ctx) {
  if (ctx.isUnauthenticated()) {
    ctx.redirect('/');
    return;
  }

  const Post = ctx.bookshelf.model('Post');

  const post = await Post.where({ id: ctx.params.id }).fetch({ require: true });
  await post.subscribers().detach(ctx.state.user);

  ctx.redirect(`/post/${post.id}`);
}

/**
 * Gets 3 related posts ordered by a number of matching tags + a random number between 0 and 3.
 */
export async function getRelatedPosts(ctx) {
  function formatArray(array) {
    return `(${array.map((e) => `'${e}'`).join(',')})`;
  }

  const knex = ctx.bookshelf.knex;
  const Post = ctx.bookshelf.model('Post');

  const post = await Post
    .forge()
    .where('id', ctx.params.id)
    .fetch({ withRelated: ['hashtags', 'geotags', 'schools'], require: true });

  const hashtagIds = post.related('hashtags').pluck('id');
  const schoolIds = post.related('schools').pluck('id');
  const geotagIds = post.related('geotags').pluck('id');

  // I've tried `leftJoinRaw`, and `on(knex.raw())`.
  // Both trow `syntax error at or near "$1"`.
  let posts = await Post.collection().query(qb => {
    const countQueries = [];

    applyFieldsQuery(qb, ctx.query, {
      allowedFields: POST_PUBLIC_COLUMNS,
      defaultFileds: POST_DEFAULT_COLUMNS
    });

    if (!_.isEmpty(hashtagIds)) {
      qb
        .leftJoin('hashtags_posts', 'posts.id', 'hashtags_posts.post_id')
        .leftJoin('hashtags', function () {
          this
            .on('hashtags_posts.hashtag_id', 'hashtags.id')
            .andOn(knex.raw(`hashtags.id IN ${formatArray(hashtagIds)}`));
        });

      countQueries.push('COUNT(DISTINCT hashtags.id)');
    }

    if (!_.isEmpty(schoolIds)) {
      qb
        .leftJoin('posts_schools', 'posts.id', 'posts_schools.post_id')
        .leftJoin('schools', function () {
          this
            .on('posts_schools.school_id', 'schools.id')
            .andOn(knex.raw(`schools.id IN ${formatArray(schoolIds)}`));
        });

      countQueries.push('COUNT(DISTINCT schools.id)');
    }

    if (!_.isEmpty(geotagIds)) {
      qb
        .leftJoin('geotags_posts', 'posts.id', 'geotags_posts.post_id')
        .leftJoin('geotags', function () {
          this
            .on('geotags_posts.geotag_id', 'geotags.id')
            .andOn(knex.raw(`geotags.id IN ${formatArray(geotagIds)}`));
        });

      countQueries.push('COUNT(DISTINCT geotags.id)');
    }

    qb
      .whereNot('posts.id', post.id)
      .groupBy('posts.id')
      .orderByRaw(`
          (${countQueries.join(' + ')} + random())
          DESC,
          fully_published_at DESC
        `)
      .limit(3);

    if (ctx.isAuthenticated()) {
      qb.whereNot('posts.user_id', ctx.state.user);
    }

    // fix `column reference "id" is ambiguous`
    qb.clearSelect();
  }).fetch({ withRelated: POST_RELATIONS });

  posts = await preparePosts(ctx, posts);

  ctx.body = posts;
}

export async function likePost(ctx) {
  const result = { success: false };

  const User = ctx.bookshelf.model('User');
  const Post = ctx.bookshelf.model('Post');

  let post = await Post.where({ id: ctx.params.id }).fetch({ require: true });
  const user = await User.where({ id: ctx.state.user }).fetch({ require: true, withRelated: ['liked_posts'] });

  if (post.get('user_id') === user.id) {
    ctx.status = 403;
    ctx.body = { error: "You can't like your own post" };
    return;
  }

  await user.liked_posts().attach(post);

  await post.save({ updated_at: new Date().toJSON() }, { patch: true });
  await post.refresh({ require: true, withRelated: ['likers'] });
  post = seq([
    PostUtils.filterUsersReactions.forUser(ctx.state.user),
    PostUtils.serialize
  ])(post);

  const likes = await ctx.bookshelf.knex
    .select('post_id')
    .from('likes')
    .where({ user_id: ctx.state.user });

  result.success = true;
  result.likes = likes.map(row => row.post_id);
  result.likers = post.likers;

  ctx.body = result;
}

export async function unlikePost(ctx) {
  const result = { success: false };

  const User = ctx.bookshelf.model('User');
  const Post = ctx.bookshelf.model('Post');

  let post = await Post.where({ id: ctx.params.id }).fetch({ require: true });
  const user = await User.where({ id: ctx.state.user }).fetch({ require: true, withRelated: ['liked_posts'] });

  await user.liked_posts().detach(post);

  await post.save({ updated_at: new Date().toJSON() }, { patch: true });
  await post.refresh({ require: true, withRelated: ['likers'] });
  post = seq([
    PostUtils.filterUsersReactions.forUser(ctx.state.user),
    PostUtils.serialize
  ])(post);

  const likes = await ctx.bookshelf.knex
    .select('post_id')
    .from('likes')
    .where({ user_id: ctx.state.user });

  result.success = true;
  result.likes = likes.map(row => row.post_id);
  result.likers = post.likers;

  ctx.body = result;
}

export async function favPost(ctx) {
  const result = { success: false };

  const User = ctx.bookshelf.model('User');
  const Post = ctx.bookshelf.model('Post');

  let post = await Post.where({ id: ctx.params.id }).fetch({ require: true });
  const user = await User.where({ id: ctx.state.user }).fetch({ require: true, withRelated: ['favourited_posts'] });

  if (post.get('user_id') === user.id) {
    ctx.status = 403;
    ctx.body = { error: "You can't add your own post to favorites" };
    return;
  }

  await user.favourited_posts().attach(post);

  await post.refresh({ require: true, withRelated: ['favourers'] });
  post = seq([
    PostUtils.filterUsersReactions.forUser(ctx.state.user),
    PostUtils.serialize
  ])(post);

  const favs = await ctx.bookshelf.knex
    .select('post_id')
    .from('favourites')
    .where({ user_id: ctx.state.user });

  result.success = true;
  result.favourites = favs.map(row => row.post_id);
  result.favourers = post.favourers;

  ctx.body = result;
}

export async function unfavPost(ctx) {
  const result = { success: false };

  const User = ctx.bookshelf.model('User');
  const Post = ctx.bookshelf.model('Post');

  let post = await Post.where({ id: ctx.params.id }).fetch({ require: true });
  const user = await User.where({ id: ctx.state.user }).fetch({ require: true, withRelated: ['favourited_posts'] });

  await user.favourited_posts().detach(post);

  await post.refresh({ require: true, withRelated: ['favourers'] });
  post = seq([
    PostUtils.filterUsersReactions.forUser(ctx.state.user),
    PostUtils.serialize
  ])(post);

  const favs = await ctx.bookshelf.knex
    .select('post_id')
    .from('favourites')
    .where({ user_id: ctx.state.user });

  result.success = true;
  result.favourites = favs.map(row => row.post_id);
  result.favourers = post.favourers;

  ctx.body = result;
}

export async function allPosts(ctx) {
  const Post = ctx.bookshelf.model('Post');
  let posts = Post.collection().query(qb => {
    applySortQuery(qb, ctx.query, { defaultValue: '-created_at' });
    applyLimitQuery(qb, ctx.query, { defaultValue: 5 });
    applyOffsetQuery(qb, ctx.query);
    applyFieldsQuery(qb, ctx.query, {
      allowedFields: POST_PUBLIC_COLUMNS,
      defaultFileds: POST_DEFAULT_COLUMNS
    });
    applyDateRangeQuery(qb, ctx.query, { field: 'created_at' });

    if ('continent' in ctx.query) {
      qb
        .distinct('posts.*')
        .join('geotags_posts', 'posts.id', 'geotags_posts.post_id')
        .join('geotags', 'geotags_posts.geotag_id', 'geotags.id')
        .where('geotags.continent_code', ctx.query.continent);
    } else if ('geotags' in ctx.query) {
      qb
        .distinct('posts.*')
        .join('geotags_posts', 'posts.id', 'geotags_posts.post_id');
    }
  });
  posts = await posts.fetch({ require: false, withRelated: POST_RELATIONS });
  posts = await preparePosts(ctx, posts);

  ctx.body = posts;
}

export async function userPosts(ctx) {
  const Post = ctx.bookshelf.model('Post');

  const q = Post.forge()
    .query(qb => {
      qb
        .join('users', 'users.id', 'posts.user_id')
        .where('users.username', '=', ctx.params.user)
        .whereIn('posts.type', ['short_text', 'long_text'])
        .offset(ctx.query.offset);

      if ('limit' in ctx.query) {
        qb.limit(ctx.query.limit);
      }

      applySortQuery(qb, ctx.query, { defaultValue: '-updated_at' });
      applyFieldsQuery(qb, ctx.query, {
        allowedFields: POST_PUBLIC_COLUMNS,
        defaultFileds: POST_DEFAULT_COLUMNS,
        table: 'posts'
      });
    });


  let posts = await q.fetchAll({ require: false, withRelated: POST_RELATIONS });
  posts = await preparePosts(ctx, posts);

  ctx.body = posts;
}

export async function hashtagPosts(ctx) {
  const Post = ctx.bookshelf.model('Post');

  const q = Post.forge()
    .query(qb => {
      qb
        .join('hashtags_posts', 'posts.id', 'hashtags_posts.post_id')
        .join('hashtags', 'hashtags_posts.hashtag_id', 'hashtags.id')
        .where('hashtags.name', '=', ctx.params.tag)
        .orderBy('posts.created_at', 'desc');

      applyFieldsQuery(qb, ctx.query, {
        allowedFields: POST_PUBLIC_COLUMNS,
        defaultFileds: POST_DEFAULT_COLUMNS,
        table: 'posts'
      });
    });

  let posts = await q.fetchAll({ require: false, withRelated: POST_RELATIONS });
  posts = await preparePosts(ctx, posts);

  ctx.body = posts;
}

export async function schoolPosts(ctx) {
  const Post = ctx.bookshelf.model('Post');

  const q = Post.collection()
    .query(qb => {
      qb
        .join('posts_schools', 'posts.id', 'posts_schools.post_id')
        .join('schools', 'posts_schools.school_id', 'schools.id')
        .where('schools.url_name', ctx.params.school)
        .andWhere('posts_schools.visible', true)
        .orderBy('posts.created_at', 'desc');

      applyFieldsQuery(qb, ctx.query, {
        allowedFields: POST_PUBLIC_COLUMNS,
        defaultFileds: POST_DEFAULT_COLUMNS,
        table: 'posts'
      });
    });

  let posts = await q.fetch({ withRelated: POST_RELATIONS });
  posts = await preparePosts(ctx, posts);

  ctx.body = posts;
}

export async function geotagPosts(ctx) {
  const Post = ctx.bookshelf.model('Post');
  const Geotag = ctx.bookshelf.model('Geotag');

  const geotag = await Geotag
    .forge()
    .where({ url_name: ctx.params.url_name })
    .fetch({ require: true });

  let posts = await Post
    .collection()
    .query(qb => {
      qb
        .join('geotags_posts', 'posts.id', 'geotags_posts.post_id')
        .join('geotags', 'geotags_posts.geotag_id', 'geotags.id')
        .orderBy('posts.created_at', 'desc')
        .distinct();

      applyFieldsQuery(qb, ctx.query, {
        allowedFields: POST_PUBLIC_COLUMNS,
        defaultFileds: POST_DEFAULT_COLUMNS,
        table: 'posts'
      });

      switch (geotag.attributes.type) {
        case 'Planet':
          // There are no planets besides Earth yet.
          break;
        case 'Continent':
          qb.where('geotags.continent_code', geotag.attributes.continent_code);
          break;
        case 'Country':
          qb.where('geotags.geonames_country_id', geotag.attributes.geonames_country_id);
          break;
        case 'AdminDivision1':
          qb.where('geotags.geonames_admin1_id', geotag.attributes.geonames_admin1_id);
          break;
        case 'City':
          qb.where('geotags.id', geotag.id);
          break;
      }
    })
    .fetch({ withRelated: POST_RELATIONS });

  posts = await preparePosts(ctx, posts);

  ctx.body = posts;
}

export async function currentUserLikedPosts(ctx) {
  const posts = await getLikedPosts(ctx.state.user, ctx);
  ctx.body = posts;
}

export async function userLikedPosts(ctx) {
  const user = await ctx.bookshelf.knex
    .first('id')
    .from('users')
    .where('users.username', '=', ctx.params.user);

  if (user) {
    const posts = await getLikedPosts(user.id, ctx);
    ctx.body = posts;
  } else {
    ctx.app.logger.warn(`Someone tried read liked posts for '${ctx.params.user}', but there's no such user`);
    ctx.body = [];
  }
}

export async function currentUserFavouredPosts(ctx) {
  const posts = await getFavouredPosts(ctx.state.user, ctx);
  ctx.body = posts;
}

export async function userFavouredPosts(ctx) {
  const user = await ctx.bookshelf.knex
    .first('id')
    .from('users')
    .where('users.username', '=', ctx.params.user);

  if (user) {
    const posts = await getFavouredPosts(user.id, ctx);
    ctx.body = posts;
  } else {
    ctx.app.logger.warn(`Someone tried read favoured posts for '${ctx.params.user}', but there's no such user`);
    ctx.body = [];
  }
}

// Helpers
export async function preparePosts(ctx, posts) {
  posts = posts.map(
    seq([
      PostUtils.filterUsersReactions.forUser(ctx.state.user),
      PostUtils.serialize
    ])
  );

  return posts;
}

async function getLikedPosts(userId, ctx) {
  const Post = ctx.bookshelf.model('Post');

  const likes = await ctx.bookshelf.knex
    .select('post_id')
    .from('likes')
    .where({ user_id: userId })
    .map(row => row.post_id);

  const q = Post.forge()
    .query(qb => {
      qb
        .select()
        .from('posts')
        .whereIn('id', likes)
        .union(function () {
          this
            .from('posts')
            .whereIn('type', ['hashtag_like', 'school_like', 'geotag_like'])
            .andWhere('user_id', userId);

          applyFieldsQuery(this, ctx.query, {
            allowedFields: POST_PUBLIC_COLUMNS,
            defaultFileds: POST_DEFAULT_COLUMNS,
          });
        })
        .orderBy('updated_at', 'desc');

      applyFieldsQuery(qb, ctx.query, {
        allowedFields: POST_PUBLIC_COLUMNS,
        defaultFileds: POST_DEFAULT_COLUMNS,
        table: 'posts'
      });
    });

  let posts = await q.fetchAll({ require: false, withRelated: POST_RELATIONS });
  posts = await preparePosts(ctx, posts);

  return posts;
}

async function getFavouredPosts(userId, ctx) {
  const Post = ctx.bookshelf.model('Post');

  const favourites = await ctx.bookshelf.knex
    .select('post_id')
    .from('favourites')
    .where({ user_id: userId })
    .map(row => row.post_id);

  const q = Post.forge()
    .query(qb => {
      qb
        .whereIn('id', favourites)
        .orderBy('posts.updated_at', 'desc');

      applyFieldsQuery(qb, ctx.query, {
        allowedFields: POST_PUBLIC_COLUMNS,
        defaultFileds: POST_DEFAULT_COLUMNS
      });
    });

  let posts = await q.fetchAll({ require: false, withRelated: POST_RELATIONS });
  posts = await preparePosts(ctx, posts);

  return posts;
}
