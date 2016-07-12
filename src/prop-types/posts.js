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
import { PropTypes } from 'react';
import { values } from 'lodash';

import POST_TYPES from '../consts/postTypeConstants';

import { date, mapOf, url, uuid4 } from './common';
import { ArrayOfGeotags } from './geotags';
import { ArrayOfHashtags } from './hashtags';
import { ArrayOfLightSchools } from './schools';

const postTypes = values(POST_TYPES);

export const Post = PropTypes.shape({
  comments: PropTypes.number.isRequired,
  created_at: date.isRequired,
  favourers: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  fully_published_at: date,
  geotags: ArrayOfGeotags.isRequired,
  hashtags: ArrayOfHashtags.isRequired,
  id: uuid4.isRequired,
  liked_geotag_id: uuid4,
  liked_hashtag_id: uuid4,
  liked_school_id: uuid4,
  likers: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  more: PropTypes.shape({
    pageTitle: PropTypes.string
  }),
  schools: ArrayOfLightSchools.isRequired,
  text: PropTypes.string,
  type: PropTypes.oneOf(postTypes).isRequired,
  updated_at: date.isRequired,
  url_name: url, // likes don't have url_name
  user_id: uuid4.isRequired
});

export const ArrayOfPosts = PropTypes.arrayOf(Post);

export const ArrayOfPostsId = PropTypes.arrayOf(uuid4);

export const MapOfPosts = mapOf(uuid4, Post);
