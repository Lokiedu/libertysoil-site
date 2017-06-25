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
 @flow
*/
export const POST_RELATIONS = Object.freeze([
  'user', 'likers', 'favourers', 'hashtags', 'schools',
  'geotags', 'liked_hashtag', 'liked_school', 'liked_geotag',
  { post_comments: qb => qb.orderBy('created_at') }, 'post_comments.user'
]);

export const USER_RELATIONS = Object.freeze([
  'following',
  'followers',
  'liked_posts',
  'favourited_posts',
  'followed_hashtags',
  'followed_geotags',
  'followed_schools',
  'liked_hashtags',
  'liked_geotags',
  'liked_schools'
]);
