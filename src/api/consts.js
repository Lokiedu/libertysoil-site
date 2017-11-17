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
import { without } from 'lodash';

export const POST_RELATIONS = Object.freeze([
  'user', 'likers', 'favourers', 'hashtags', 'schools',
  'geotags', 'liked_hashtag', 'liked_school', 'liked_geotag',
  { post_comments: (qb: Object) => qb.orderBy('created_at') }, 'post_comments.user'
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

export const POST_PUBLIC_COLUMNS = [
  'id', 'user_id', 'text', 'type', 'created_at', 'updated_at',
  'more', 'fully_published_at', 'liked_hashtag_id', 'liked_school_id', 'liked_geotag_id',
  'url_name', '_sphinx_id', 'text_source', 'text_type',
  'like_count', 'fav_count', 'comment_count', 'score'
];

export const POST_DEFAULT_COLUMNS = without(POST_PUBLIC_COLUMNS, 'text', 'text_source');

export const SUPPORTED_LOCALES = Object.keys(
  require('../consts/localization').SUPPORTED_LOCALES
);

export const SEARCH_INDEXES_TABLE = {
  comments: 'CommentsRT',
  hashtags: 'HashtagsRT',
  locations: 'GeotagsRT',
  people: 'UsersRT',
  posts: 'PostsRT',
  schools: 'SchoolsRT'
};

export const SEARCH_RESPONSE_TABLE = {
  Comment: 'comments',
  Hashtag: 'hashtags',
  Geotag: 'locations',
  User: 'people',
  Post: 'posts',
  School: 'schools'
};
