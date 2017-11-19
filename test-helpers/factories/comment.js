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
import { Factory } from 'rosie';
import faker from 'faker';

import { bookshelf, knex } from '../db';


const Comment = bookshelf.model('Comment');

const CommentFactory = new Factory()
  .attr('id', () => uuid.v4())
  .attr('text', () => faker.lorem.paragraph());

export default CommentFactory;

export async function createComment(attrs = {}) {
  return await new Comment(CommentFactory.build(attrs))
    .save(null, { method: 'insert' });
}

export async function createComments(attrs) {
  if (typeof attrs === 'number') {
    attrs = Array.apply(null, Array(attrs));
  }

  const fullAttrs = attrs.map(attrs => CommentFactory.build(attrs));
  const ids = await knex.batchInsert('comments', fullAttrs).returning('id');
  const comments = await Comment.collection().query(qb => qb.whereIn('id', ids)).fetch({ require: true });

  return comments.toArray();
}
