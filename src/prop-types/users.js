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
import PropTypes from 'prop-types';

import { ROLES } from '../consts/profileConstants';

import { date, url, uuid4, mapOf } from './common';
import { Attachment } from './attachments';
import { Geotag, ArrayOfGeotags } from './geotags';
import { Hashtag, ArrayOfHashtags } from './hashtags';
import { School, ArrayOfSchools } from './schools';
import { ArrayOfPostsId } from './posts';

export const UserRole = PropTypes.shape({
  description: PropTypes.string,
  title: PropTypes.oneOf(ROLES).isRequired
});

export const UserMore = PropTypes.shape({
  avatar: Attachment,
  bio: PropTypes.string,
  firstName: PropTypes.string,
  first_login: PropTypes.bool.isRequired,
  head_pic: Attachment,
  lastName: PropTypes.string,
  roles: PropTypes.arrayOf(UserRole),
  summary: PropTypes.string
});

export const UserRecentTags = PropTypes.shape({
  geotags: ArrayOfGeotags.isRequired,
  hashtags: ArrayOfHashtags.isRequired,
  schools: ArrayOfSchools.isRequired
});

export const User = PropTypes.shape({
  created_at: date.isRequired,
  followed_geotags: ArrayOfGeotags,
  followed_hashtags: ArrayOfHashtags,
  followed_schools: ArrayOfSchools,
  fullName: PropTypes.string,
  gravatarHash: PropTypes.string,
  id: uuid4.isRequired,
  liked_geotags: ArrayOfGeotags,
  liked_hashtags: ArrayOfHashtags,
  liked_schools: ArrayOfSchools,
  more: UserMore.isRequired,
  updated_at: date.isRequired,
  username: url.isRequired
});

export const ArrayOfUsers = PropTypes.arrayOf(User);

export const ArrayOfUsersId = PropTypes.arrayOf(uuid4);

export const MapOfUsers = mapOf(uuid4, User);

export const CurrentUser = PropTypes.shape({
  favourites: PropTypes.arrayOf(uuid4).isRequired,
  followed_geotags: mapOf(url, Geotag).isRequired,
  followed_hashtags: mapOf(url, Hashtag).isRequired,
  followed_schools: mapOf(url, School).isRequired,
  geotags: ArrayOfGeotags.isRequired,
  hashtags: ArrayOfHashtags.isRequired,
  id: uuid4,
  liked_geotags: mapOf(url, Geotag).isRequired,
  liked_hashtags: mapOf(url, Hashtag).isRequired,
  liked_schools: mapOf(url, School).isRequired,
  likes: ArrayOfPostsId.isRequired,
  recent_tags: UserRecentTags.isRequired,
  schools: ArrayOfSchools.isRequired,
  suggested_users: ArrayOfUsers.isRequired,
  user: User
});
