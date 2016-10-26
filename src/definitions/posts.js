/*
 This file is a part of libertysoil.org website
 Copyright (C) 2016  Loki Education (Social Enterprise)

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
import type { DateType, Integer, UrlNode, Uuid4 } from './common';
import type { Geotag, GeotagId } from './geotags';
import type { Hashtag, HashtagId } from './hashtags';
import type { LightSchool, SchoolId } from './schools';
import type { User } from './users';

export type PostId = Uuid4;

export type PostType =
  | 'short_text'
  | 'long_text'
  | 'geotag_like'
  | 'hashtag_like'
  | 'school_like';

export type PostMore = {
  pageTitle?: string
};

export type UserUpdateablePostData = {
  geotags?: Array<Geotag>,
  hashtags?: Array<Hashtag>,
  minor_update?: ?boolean,
  schools?: Array<LightSchool>,
  text?: string
};

export type Post = UserUpdateablePostData & {
  comments: Integer,
  created_at: DateType,
  favourers: Array<User>,
  fully_published_at?: DateType,
  id: PostId,
  liked_geotag_id?: GeotagId,
  liked_hashtag_id?: HashtagId,
  liked_school_id?: SchoolId,
  likers: Array<User>,
  more?: PostMore,
  type: PostType,
  updated_at: DateType,
  url_name?: UrlNode, // likes don't have url_name
  user_id: Uuid4 // TODO: replace to UserId
};
