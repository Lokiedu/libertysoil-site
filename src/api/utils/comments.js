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

export async function countComments(bookshelf, posts) {
  const ids = posts.map(post => {
    return post.get('id');
  });

  if (ids.length < 1) {
    return {};
  }
  const Comment = bookshelf.model('Comment');
  const q = Comment.forge()
    .query(qb => {
      qb
        .select('post_id')
        .count('id as comment_count')
        .where('post_id', 'IN', ids)
        .groupBy('post_id');
    });

  const raw_counts = await q.fetchAll();

  const mapped_counts = _.mapValues(_.keyBy(raw_counts.toJSON(), 'post_id'), (item => {
    return parseInt(item.comment_count);
  }));

  const missing = _.difference(ids, _.keys(mapped_counts));

  const zeroes = _.fill(_.clone(missing), 0, 0, missing.length);
  return _.merge(_.zipObject(missing, zeroes), mapped_counts);
}
