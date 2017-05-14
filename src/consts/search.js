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
*/
import type { SearchType, SortingType } from '../definitions/filters';

export const SEARCH_RESULTS: SearchType[] = [
  { name: 'Show everything', value: 'all',
    isDefault: true, combine: false },
  { name: 'Schools', value: 'schools',
    combine: { except: ['all'] } },
  { name: 'Locations', value: 'locations',
    combine: { except: ['all'] } },
  { name: 'Posts', value: 'posts',
    combine: { except: ['all'] } },
  { name: 'People', value: 'people',
    combine: { except: ['all'] } },
];

export const SEARCH_SORTING_TYPES: SortingType[] = [
  { name: 'By relevance', value: '-q', isDefault: true },
  { name: 'Newest', value: '-updated_at' }
];

export const SEARCH_RESULTS_PER_PAGE = 20;

export const SEARCH_SECTIONS_COUNTABILITY = {
  comments: ['comment', 'comments'],
  geotags: ['geotag', 'geotags'],
  locations: ['location', 'locations'],
  hashtags: ['hashtag', 'hashtags'],
  people: ['person', 'people'],
  posts: ['post', 'posts'],
  schools: ['school', 'schools']
};

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
