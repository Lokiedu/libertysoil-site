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
// @flow
import { pick } from 'lodash';
import type { Model } from 'bookshelf/lib/model';

import type { UserId } from '../../definitions/users';
import type { Post } from '../../definitions/posts';
import { countComments } from './comments';

export function serialize(model: Model): Object {
  if (model.relations.schools) {
    model.relations.schools = model.relations.schools.map((row: Model) => (
      pick(row.attributes, 'id', 'name', 'url_name')
    ));
  }

  return model.toJSON();
}

/**
 * Remove other users' reactions from post's attributes
 * @param {PostModel} post Post model to filter the reactions
 * @param {String} userId Current user's id
 */
export function filterUsersReactions(post: Model, userId: UserId): Model {
  if (!userId || post.attributes.user_id === userId) {
    return resetPostReactions(post);
  }

  return keepOwnPostReactions(userId, post);
}

filterUsersReactions.forUser = (userId: UserId) =>
  userId
    ? keepOwnPostReactions.bind(null, userId)
    : resetPostReactions;

function resetPostReactions(post: Model): Model {
  const { favourers, likers } = post.relations;
  favourers && favourers.reset();
  likers && likers.reset();

  return post;
}

function keepOwnPostReactions(userId: UserId, post: Model): Model {
  const { favourers, likers } = post.relations;

  if (favourers) {
    const userAsFavourer = favourers.findWhere({ id: userId });
    favourers.reset();
    favourers.add(userAsFavourer);
  }

  if (likers) {
    const userAsLiker = likers.findWhere({ id: userId });
    likers.reset();
    likers.add(userAsLiker);
  }

  return post;
}

export async function countPostComments(bookshelf: Object, posts: Array<Post>): Promise<Array<Post>> {
  const commentCounts = await countComments(bookshelf, posts);
  return posts.map((post: Model): Post => {
    post.attributes.comments = commentCounts[post.get('id')];
    return post;
  });
}
