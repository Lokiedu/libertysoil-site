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
import uuid from 'uuid';

import { GeotagValidator } from '../validators';
import { applyLimitQuery, applyOffsetQuery, applySortQuery } from '../utils/filters';

export async function getGeotag(ctx) {
  const Geotag = ctx.bookshelf.model('Geotag');

  const geotag = await Geotag
    .forge()
    .where('url_name', ctx.params.url_name)
    .fetch({ require: true, withRelated: ['country', 'admin1', 'continent', 'geonames_city'] });

  ctx.body = geotag;
}

export async function getGeotags(ctx) {
  const Geotag = ctx.bookshelf.model('Geotag');

  const ALLOWED_ATTRIBUTE_QUERIES = [
    'type',
    'country_code', 'continent_code',
    'continent_id', 'country_id', 'admin1_id',
    'name', 'url_name'
  ];

  const geotags = await Geotag.collection()
    .query(qb => {
      applyLimitQuery(qb, ctx.query, { defaultValue: 10 });
      applyOffsetQuery(qb, ctx.query, { defaultValue: 0 });
      applySortQuery(qb, ctx.query, { defaultValue: 'url_name' });
      qb.where(_.pick(ctx.query, ALLOWED_ATTRIBUTE_QUERIES));
    })
    .fetch();

  ctx.body = geotags;
}

export async function updateGeotag(ctx) {
  const Geotag = ctx.bookshelf.model('Geotag');

  let more = Joi.attempt(ctx.request.body, GeotagValidator).more;
  const geotag = await Geotag.where({ id: ctx.params.id }).fetch({ require: true });

  more.last_editor = ctx.state.user;
  more = _.extend(geotag.get('more'), more);

  geotag.set('more', more);
  await geotag.save(null, { method: 'update' });

  ctx.body = geotag;
}

export async function searchGeotags(ctx) {
  const geotags = await getSimilarGeotags(ctx.bookshelf, ctx.params.query, ctx.query);
  ctx.body = { geotags };
}

export async function getUserRecentGeotags(ctx) {
  const Geotag = ctx.bookshelf.model('Geotag');

  const geotags = await Geotag.getRecentlyUsed()
    .query(qb => {
      qb
        .where('posts.user_id', ctx.state.user)
        .limit(5);
    })
    .fetch();

  ctx.body = geotags;
}

export async function followGeotag(ctx) {
  const User = ctx.bookshelf.model('User');
  const Geotag = ctx.bookshelf.model('Geotag');

  const currentUser = await User.forge().where('id', ctx.state.user).fetch();
  const geotag = await Geotag.forge().where('url_name', ctx.params.url_name).fetch({ require: true });

  await currentUser.followGeotag(geotag.id);

  ctx.body = { success: true, geotag };
}

export async function unfollowGeotag(ctx) {
  const User = ctx.bookshelf.model('User');
  const Geotag = ctx.bookshelf.model('Geotag');

  const currentUser = await User.forge().where('id', ctx.state.user).fetch();
  const geotag = await Geotag.forge().where('url_name', ctx.params.url_name).fetch({ require: true });

  await currentUser.unfollowGeotag(geotag.id);

  ctx.body = { success: true, geotag };
}

export async function likeGeotag(ctx) {
  const User = ctx.bookshelf.model('User');
  const Geotag = ctx.bookshelf.model('Geotag');
  const Post = ctx.bookshelf.model('Post');

  const user = await User.where({ id: ctx.state.user }).fetch({ require: true, withRelated: ['liked_hashtags'] });
  const geotag = await Geotag.where({ url_name: ctx.params.url_name }).fetch({ require: true });

  await user.liked_geotags().detach(geotag);
  await user.liked_geotags().attach(geotag);

  await new Post({
    id: uuid.v4(),
    fully_published_at: new Date().toJSON(),
    type: 'geotag_like',
    liked_geotag_id: geotag.id,
    user_id: user.id
  }).save(null, { method: 'insert' });

  ctx.body = { success: true, geotag };
}

export async function unlikeGeotag(ctx) {
  const User = ctx.bookshelf.model('User');
  const Geotag = ctx.bookshelf.model('Geotag');
  const Post = ctx.bookshelf.model('Post');

  const user = await User.where({ id: ctx.state.user }).fetch({ require: true, withRelated: ['liked_hashtags'] });
  const geotag = await Geotag.where({ url_name: ctx.params.url_name }).fetch({ require: true });

  await user.liked_geotags().detach(geotag);

  await Post
    .where({
      user_id: user.id,
      liked_geotag_id: geotag.id
    })
    .destroy();

  ctx.body = { success: true, geotag };
}

export async function checkGeotagExists(ctx) {
  const Geotag = ctx.bookshelf.model('Geotag');

  await Geotag.where('name', ctx.params.name).fetch({ require: true });
  ctx.status = 200;
}

export async function getGeotagCloud(ctx) {
  const Geotag = ctx.bookshelf.model('Geotag');

  const continentCodes = [
    'EU', 'NA', 'SA', 'AF', 'AS', 'OC', 'AN'
  ];

  const geotagsByContinents = [];

  for (const code of continentCodes) {
    const count = await Geotag
      .collection()
      .query(qb => {
        qb
          .where('continent_code', code)
          .whereNot('type', 'Continent')
          .join('geotags_posts', 'geotags.id', 'geotags_posts.geotag_id');
      })
      .count();

    const geotags = await Geotag
      .collection()
      .query(qb => {
        qb
          .where('continent_code', code)
          .where('post_count', '>', '0')
          .whereNot('type', 'Continent')
          .orderByRaw('post_count DESC, name ASC')
          .limit(10);
      })
      .fetch();

    geotagsByContinents.push({
      continent_code: code,
      geotag_count: parseInt(count),
      geotags
    });
  }

  ctx.body = geotagsByContinents;
}

export async function getCountries(ctx) {
  const Geotag = ctx.bookshelf.model('Geotag');

  const countries = await Geotag.where({ type: 'Country' }).fetchAll();
  ctx.body = countries;
}

// Helpers

async function getSimilarGeotags(bookshelf, query, queryParams) {
  const Geotag = bookshelf.model('Geotag');
  const knex = bookshelf.knex;
  // Transform initial query into a string of tokens separated by the & operator.
  const finalQuery = query
    .replace(/(\||&|!|\(|\))/g, '') // remove operators
    .split(' ')
    .filter(t => !!t.length) // filter out empty tokens
    .map(t => `${t}:*`)
    .join(' & ');

  const geotags = await Geotag.collection().query((qb) => {
    qb
      .select(knex.raw(`*, ts_rank_cd('{1.0, 1.0, 0.8, 0.4}', tsv, query) as rank`))
      .from(knex.raw(`geotags, to_tsquery(?) query`, finalQuery))
      .whereRaw('tsv @@ query')
      .orderBy('rank', 'DESC')
      .limit(queryParams.limit || 10)
      .offset(queryParams.offset);
  }).fetch({ withRelated: ['country', 'admin1'] });

  return geotags;
}
