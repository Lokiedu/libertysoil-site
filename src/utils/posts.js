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
import { filter, find } from 'lodash';
import type Knex from 'knex';

import type { Post } from '../definitions/posts';
import type { RawUser } from '../definitions/users';

function hide(
  postId, userId, arrayOfUserPosts, arrayToFilter = []
): Array<RawUser> {
  let filtered = arrayToFilter;

  if (userId) {
    if (!find(arrayOfUserPosts, p => p === postId)) {
      filtered = filter(arrayToFilter, { id: userId });
    }
  } else {
    filtered = [];
  }

  return filtered;
}

export async function hidePostsData(
  target: Object | Array<Object>,
  ctx: string | Object,
  qb: Knex,
  convertToJSON?: boolean = true
): Promise<Array<Post>> {
  let userId = '';
  let userPosts = [];

  if (typeof ctx === 'string') {
    userId = ctx;
  } else if (ctx.session && ctx.session.user) {
    userId = ctx.session.user;
  }

  if (userId) {
    userPosts = await qb
      .select('id')
      .from('posts')
      .where({ user_id: userId });
    userPosts = userPosts.map(post => post.id);
  }

  let filtered;
  if (Array.isArray(target)) {
    filtered = target.map((post): Post => {
      let plainPost = post;
      if (convertToJSON && post.toJSON instanceof Function) {
        plainPost = post.toJSON();
      }

      return {
        ...plainPost,
        favourers: hide(plainPost.id, userId, userPosts, plainPost.favourers),
        likers: hide(plainPost.id, userId, userPosts, plainPost.likers)
      };
    });
  } else {
    let plainPost = target;
    if (convertToJSON && target.toJSON instanceof Function) {
      plainPost = target.toJSON();
    }

    filtered = {
      ...plainPost,
      favourers: hide(plainPost.id, userId, userPosts, plainPost.favourers),
      likers: hide(plainPost.id, userId, userPosts, plainPost.likers)
    };
  }

  return filtered;
}
