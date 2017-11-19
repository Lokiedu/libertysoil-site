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
// Uncategorized stuff.
import { SUPPORTED_LOCALES } from '../consts';

export async function getLocale(ctx) {
  const { lang_code } = ctx.params;

  if (!SUPPORTED_LOCALES.find(c => lang_code === c)) {
    ctx.status = 404;
    ctx.body = { error: 'Locale isn\'t supported' };
    return;
  }

  // eslint-disable-next-line prefer-template
  const locale = require('../../../res/locale/' + lang_code + '.json');

  ctx.status = 200;
  ctx.body = locale;
}

export async function getQuotes(ctx) {
  const Quote = ctx.bookshelf.model('Quote');

  const quotes = await Quote
    .collection()
    .query(qb => {
      qb.orderBy('last_name');
    })
    .fetch();

  ctx.body = quotes;
}

export async function userTags(ctx) {
  const Hashtag = ctx.bookshelf.model('Hashtag');
  const hashtags = await Hashtag
    .collection()
    .query(qb => {
      qb
        .join('hashtags_posts', 'hashtags_posts.hashtag_id', 'hashtags.id')
        .join('posts', 'hashtags_posts.post_id', 'posts.id')
        .where('posts.user_id', ctx.state.user)
        .distinct();
    })
    .fetch();

  const School = ctx.bookshelf.model('School');
  const schools = await School
    .collection()
    .query(qb => {
      qb
        .join('posts_schools', 'posts_schools.school_id', 'schools.id')
        .join('posts', 'posts_schools.post_id', 'posts.id')
        .where('posts.user_id', ctx.state.user)
        .distinct();
    })
    .fetch();

  const Geotag = ctx.bookshelf.model('Geotag');
  const geotags = await Geotag
    .collection()
    .query(qb => {
      qb
        .join('geotags_posts', 'geotags_posts.geotag_id', 'geotags.id')
        .join('posts', 'geotags_posts.post_id', 'posts.id')
        .where('posts.user_id', ctx.state.user)
        .distinct();
    })
    .fetch();

  ctx.body = { hashtags, schools, geotags };
}

export async function getRecentlyUsedTags(ctx) {
  const Hashtag = ctx.bookshelf.model('Hashtag');
  const School = ctx.bookshelf.model('School');
  const Geotag = ctx.bookshelf.model('Geotag');
  const Post = ctx.bookshelf.model('Post');

  const tags = await ctx.cache.getCachedJson(
    'recentlyUsedTags',
    async () => {
      const yesterday = new Date();
      yesterday.setHours(yesterday.getHours() - 24);

      // Count fails prob because of the tag models that are used for couting posts (or not)

      return {
        hashtags: {
          entries: await Hashtag.getRecentlyUsed({ limit: 5 }).fetch(),
          post_count: await Post.countWithTags({ tagType: 'hashtag', since: yesterday }),
        },
        schools: {
          entries: await School.getRecentlyUsed({ limit: 5 }).fetch(),
          post_count: await Post.countWithTags({ tagType: 'school', since: yesterday }),
        },
        geotags: {
          entries: await Geotag.getRecentlyUsed({ limit: 5 }).fetch(),
          post_count: await Post.countWithTags({ tagType: 'geotag', since: yesterday }),
        },
      };
    }
  );

  ctx.body = tags;
}
