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
import { filter, find, assign } from 'lodash';

function hide(postId, userId, arrayOfUserPosts, arrayToFilter = []) {
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

export async function hidePostsData(target, ctx, qb, convertToJSON = true) {
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
    filtered = target.map(post => {
      let plainPost = post;
      if (convertToJSON && post.toJSON instanceof Function) {
        plainPost = post.toJSON();
      }

      return assign({}, plainPost, {
        favourers: hide(plainPost.id, userId, userPosts, plainPost.favourers),
        likers: hide(plainPost.id, userId, userPosts, plainPost.likers)
      });
    });
  } else {
    let plainPost = target;
    if (convertToJSON && target.toJSON instanceof Function) {
      plainPost = target.toJSON();
    }

    filtered = assign({}, plainPost, {
      favourers: hide(plainPost.id, userId, userPosts, plainPost.favourers),
      likers: hide(plainPost.id, userId, userPosts, plainPost.likers)
    });
  }

  return filtered;
}
