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
import slug from 'slug';
import Joi from 'joi';

import { SchoolValidator } from '../validators';
import { applySortQuery, applyLimitQuery, applyOffsetQuery } from '../utils/filters';

export async function getSchoolCloud(ctx) {
  const School = ctx.bookshelf.model('School');

  const schools = await School
    .collection()
    .query(qb => {
      qb
        .where('post_count', '>', '0')
        .orderByRaw('post_count DESC, name ASC')
        .limit(50);
    })
    .fetch({ require: true });

  ctx.body = schools;
}

export async function checkSchoolExists(ctx) {
  const School = ctx.bookshelf.model('School');

  await School.where('name', ctx.params.name).fetch({ require: true });
  ctx.status = 200;
}

export async function getSchool(ctx) {
  const School = ctx.bookshelf.model('School');

  const school = await School
    .where({ url_name: ctx.params.url_name })
    .fetch({ require: true, withRelated: 'images' });

  ctx.body = school;
}

export async function getSchools(ctx) {
  const School = ctx.bookshelf.model('School');

  const schools = await School.collection().query(qb => {
    applyLimitQuery(qb, ctx.query);
    applyOffsetQuery(qb, ctx.query);
    applySortQuery(qb, ctx.query, 'name');

    if (ctx.query.havePosts) {
      qb.where('post_count', '>', 0);
    }

    if (ctx.query.startWith) {
      qb.where('name', 'ILIKE', `${ctx.query.startWith}%`);
    }
  }).fetch({ withRelated: 'images' });

  ctx.body = schools;
}

export async function getSchoolsAlphabet(ctx) {
  const knex = ctx.bookshelf.knex;

  const alphabet = await knex('schools')
    .select(knex.raw('DISTINCT(upper(substring(name FROM 1 FOR 1))) as letter'))
    .where('post_count', '>', 0)
    .orderBy('letter');

  ctx.body = alphabet
    .map(row => row.letter)
    .filter(l => l && l.length);
}

export async function likeSchool(ctx) {
  const User = ctx.bookshelf.model('User');
  const School = ctx.bookshelf.model('School');
  const Post = ctx.bookshelf.model('Post');

  const user = await User.where({ id: ctx.state.user }).fetch({ require: true, withRelated: ['liked_hashtags'] });
  const school = await School.where({ url_name: ctx.params.url_name }).fetch({ require: true });

  await user.liked_schools().detach(school);
  await user.liked_schools().attach(school);

  await new Post({
    id: uuid.v4(),
    fully_published_at: new Date().toJSON(),
    type: 'school_like',
    liked_school_id: school.id,
    user_id: user.id
  }).save(null, { method: 'insert' });

  ctx.body = { success: true, school };
}

export async function unlikeSchool(ctx) {
  const User = ctx.bookshelf.model('User');
  const School = ctx.bookshelf.model('School');
  const Post = ctx.bookshelf.model('Post');

  const user = await User.where({ id: ctx.state.user }).fetch({ require: true, withRelated: ['liked_hashtags'] });
  const school = await School.where({ url_name: ctx.params.url_name }).fetch({ require: true });

  await user.liked_schools().detach(school);

  await Post
    .where({
      user_id: user.id,
      liked_school_id: school.id
    })
    .destroy();

  ctx.body = { success: true, school };
}

export async function followSchool(ctx) {
  const User = ctx.bookshelf.model('User');
  const School = ctx.bookshelf.model('School');

  if (!ctx.params.name) {
    ctx.status = 400;
    ctx.body = { error: '"name" parameter is not given' };
    return;
  }

  const currentUser = await User.forge().where('id', ctx.state.user).fetch();
  const school = await School.forge().where('url_name', ctx.params.name).fetch({ require: true });

  await currentUser.followSchool(school.id);

  ctx.body = { success: true, school };
}

export async function unfollowSchool(ctx) {
  const User = ctx.bookshelf.model('User');
  const School = ctx.bookshelf.model('School');

  if (!ctx.params.name) {
    ctx.status = 400;
    ctx.body = { error: '"name" parameter is not given' };
    return;
  }

  const currentUser = await User.forge().where('id', ctx.state.user).fetch();
  const school = await School.forge().where('url_name', ctx.params.name).fetch({ require: true });

  await currentUser.unfollowSchool(school.id);

  ctx.body = { success: true, school };
}

export async function createSchool(ctx) {
  const School = ctx.bookshelf.model('School');

  const attributes = Joi.attempt(ctx.request.body, SchoolValidator);

  const { name } = attributes;

  if (await School.where({ name }).fetch()) {
    ctx.status = 409;
    ctx.body = { error: 'School with such name is already registered' };
    return;
  }

  attributes.more.last_editor = ctx.state.user;

  const school = new School({
    id: uuid.v4(),
    ...attributes
  });

  school.set('url_name', slug(attributes.name));

  await school.save(null, { method: 'insert' });

  // 'school' variable doesn't contain default school properties (e.g. 'post_count')
  const newSchool = await School.where({ name }).fetch({ require: true });

  ctx.body = newSchool;
}

export async function updateSchool(ctx) {
  const School = ctx.bookshelf.model('School');

  const school = await School.where({ id: ctx.params.id }).fetch({ require: true, withRelated: 'images' });
  const attributes = Joi.attempt(ctx.request.body, SchoolValidator);

  attributes.more.last_editor = ctx.state.user;
  attributes.more = _.extend(school.get('more'), attributes.more);
  school.set(attributes);

  if (ctx.request.body.images) {
    if (!_.isArray(ctx.request.body.images)) {
      ctx.status = 400;
      ctx.body = { error: `"images" parameter is expected to be an array` };
      return;
    }

    const images = _.uniq(ctx.request.body.images);

    if (_.isArray(images)) {
      school.updateImages(images);
    }
  }

  await school.save();

  ctx.body = school;
}

export async function searchSchools(ctx) {
  const query = ctx.params.query;

  const schools = await getSimilarSchools(ctx.bookshelf, query);
  ctx.body = { schools };
}

export async function getUserRecentSchools(ctx) {
  const School = ctx.bookshelf.model('School');

  const schools = await School.getRecentlyUsed()
    .query(qb => {
      qb
        .where('posts.user_id', ctx.state.user)
        .limit(5);
    })
    .fetch();

  ctx.body = schools;
}

// Helpers

async function getSimilarSchools(bookshelf, query) {
  const School = bookshelf.model('School');

  const schools = await School.collection().query(function (qb) {
    qb
      .where('name', 'ILIKE', `${query}%`)
      .limit(10);
  }).fetch();

  return schools;
}
