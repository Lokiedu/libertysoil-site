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
import { List, Map as ImmutableMap } from 'immutable';
import { TAG_HASHTAG, TAG_LOCATION, TAG_SCHOOL } from '../consts/tags';

/**
 * Converts hashtags(labels), schools, and other tags to the same format.
 * { urlId, name, type }
 * @param {Object} params {hashtags: Immutable.List, schools: Immutable.List, geotags: Immutable.List}
 * @returns {Array}
 */
export function convertModelsToTags(params = ImmutableMap({})) {
  const allTags = [];

  if (List.isList(params.get('geotags'))) {
    params.get('geotags').forEach(function (tag) {
      allTags.push({
        urlId: tag.get('url_name'),
        name: tag.get('name'),
        postCount: tag.get('post_count'),
        type: TAG_LOCATION
      });
    });
  }


  if (List.isList(params.get('locations'))) {
    params.get('locations').forEach(function (tag) {
      allTags.push({
        urlId: tag.get('url_name'),
        name: tag.get('name'),
        postCount: tag.get('post_count'),
        type: TAG_LOCATION
      });
    });
  }

  if (List.isList(params.get('schools'))) {
    params.get('schools').forEach(function (school) {
      allTags.push({
        urlId: school.get('url_name'),
        name: school.get('name'),
        postCount: school.get('post_count'),
        type: TAG_SCHOOL
      });
    });
  }

  if (List.isList(params.get('hashtags'))) {
    params.get('hashtags').forEach(function (tag) {
      allTags.push({
        urlId: tag.get('name'),
        name: tag.get('name'),
        postCount: tag.get('post_count'),
        type: TAG_HASHTAG
      });
    });
  }

  return allTags;
}

export function compareTagsByDate(lhs, rhs) {
  const lhsDate = new Date(lhs.get('updated_at'));
  const rhsDate = new Date(rhs.get('updated_at'));

  if (lhsDate > rhsDate) { return -1; }
  if (lhsDate < rhsDate) { return 1; }

  return 0;
}

export const getId = tag => tag.id;
export const getName = tag => tag.name;
export const getUrlName = tag => tag.url_name;
