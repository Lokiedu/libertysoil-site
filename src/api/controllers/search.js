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
import _ from 'lodash';

import * as PostUtils from '../utils/posts';
import { seq } from '../../utils/lang';
import { countComments } from '../utils/comments';
import { SearchQueryValidator } from '../validators';
import { SEARCH_INDEXES_TABLE, SEARCH_RESPONSE_TABLE, POST_RELATIONS } from '../consts';

// Only for common search controllers. Specialized search controllers (e.g. searchPosts, searchTags)
// go to their respective modules.
export async function searchStats(ctx) {
  const q = ctx.params.query;

  ctx.sphinx.api.SetMatchMode(4); //SPH_MATCH_EXTENDED
  ctx.sphinx.api.SetLimits(0, 100, 100, 100);

  const result = await ctx.sphinx.api.QueryAsync(`*${q}*`, 'PostsRT,UsersRT,HashtagsRT,GeotagsRT,SchoolsRT,CommentsRT');

  if ('matches' in result) {
    const result_count = _.countBy(result.matches, (value) => {
      const valueType = value.attrs.type.toLowerCase();
      return `${valueType}s`;
    });
    ctx.body = result_count;
  } else {
    ctx.body = {};
  }
}

export async function search(ctx) {
  Joi.attempt(ctx.query, SearchQueryValidator);

  const { show } = ctx.query;
  let indexes;
  if (typeof show === 'string') {
    if (show === 'all') {
      indexes = _.values(SEARCH_INDEXES_TABLE);
    } else {
      indexes = [SEARCH_INDEXES_TABLE[show]];
    }
  } else if (Array.isArray(show)) {
    indexes = _.values(_.pickBy(SEARCH_INDEXES_TABLE, (v, k) =>
      show.includes(k)
    ));
  } else {
    indexes = _.values(SEARCH_INDEXES_TABLE);
  }

  ctx.sphinx.api.SetMatchMode(4); // SphinxClient.SPH_MATCH_EXTENDED

  const limit = parseInt(ctx.query.limit, 10) || 20;
  const offset = parseInt(ctx.query.offset, 10) || 0;
  ctx.sphinx.api.SetLimits(offset, limit, offset + limit + 1000);

  if (!ctx.query.sort || ctx.query.sort === '-q') {
    ctx.sphinx.api.SetSortMode(0); // SphinxClient.SPH_SORT_RELEVANCE
  } else {
    ctx.sphinx.api.SetSortMode(1, 'updated_at'); // SphinxClient.SPH_SORT_ATTR_DESC
  }

  for (let i = 0, l = indexes.length, q = `*${ctx.query.q}*`; i < l; ++i) {
    ctx.sphinx.api.AddQuery(q, indexes[i]);
  }

  const results = await ctx.sphinx.api.RunQueriesAsync();
  const nonEmptyResults = results.filter(group => group.total_found > 0);

  if (nonEmptyResults.length > 0) {
    const processedGroups = await Promise.all(
      nonEmptyResults.map(group => {
        const type = group.matches[0].attrs.type,
          Model = ctx.bookshelf.model(type),
          ids   = group.matches.map(item => item.attrs.uuid);

        if (type === 'Post') {
          return Model.forge().query(qb => qb.whereIn('id', ids))
            .fetchAll({ require: false, withRelated: POST_RELATIONS })
            .then(posts => Promise.all([posts, countComments(ctx.bookshelf, posts)]))
            .then(([posts, postCommentsCount]) => {
              const ps = posts.map(
                seq([
                  post => {
                    post.relations.schools = post.relations.schools.map(row => ({
                      id: row.id,
                      name: row.attributes.name,
                      url_name: row.attributes.url_name
                    }));
                    post.attributes.comments = postCommentsCount[post.get('id')];
                    return post;
                  },
                  PostUtils.filterUsersReactions.forUser(ctx.session && ctx.session.user),
                  PostUtils.serialize
                ])
              );

              return {
                [SEARCH_RESPONSE_TABLE[type]]: {
                  count: group.total_found,
                  items: ps
                }
              };
            });
        }

        return Model.forge()
          .query(qb => qb.whereIn('id', ids)).fetchAll()
          .then(items => ({
            [SEARCH_RESPONSE_TABLE[type]]: {
              count: group.total_found, items
            }
          }));
      }));

    ctx.body = processedGroups.reduce(
      (res, groupData) => Object.assign(res, groupData),
      {}
    );
  } else {
    ctx.status = 404;
  }
}
