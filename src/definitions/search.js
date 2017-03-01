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
import type { Geotag } from './geotags';
import type { Hashtag } from './hashtags';
import type { Post } from './posts';
import type { School } from './schools';
import type { User } from './users';

export type SearchResult<T> = {
  items: Array<T>,
  count: number
};

export type SearchResponse = {
  geotags?: SearchResult<Geotag>,
  hashtags?: SearchResult<Hashtag>,
  posts?: SearchResult<Post>,
  schools?: SearchResult<School>,
  users?: SearchResult<User>
};

export type SearchResultType =
  | 'all'
  | 'comments'
  | 'hashtags'
  | 'locations'
  | 'posts'
  | 'people'
  | 'schools'

export type SearchQuery = {
  offset?: number | string,
  show?: SearchResultType | Array<SearchResultType>,
  sort?: '-q' | '-updated_at',
  q?: string
};
