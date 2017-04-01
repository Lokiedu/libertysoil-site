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
import { reify } from 'flow-runtime';
import type { Type } from 'flow-runtime';

import type { Email, DateString, Map, UrlNode, Uuid4 } from './common';
import type { Attachment } from './attachments';
import type { Geotag } from './geotags';
import type { Hashtag } from './hashtags';
import type { School } from './schools';

export type UserId = Uuid4;

export const isPassword = (x: string): ?string => {  // eslint-disable-line consistent-return
  if (!x.match(/^[\x20-\x7E]{8,}$/)) {
    return 'must be a valid password';
  }
};

export type Password = string;
const PasswordType = (reify: Type<Password>);
PasswordType.addConstraint(isPassword);

export const isUsername = (x: string): ?string => {  // eslint-disable-line consistent-return
  if (!x.match(/^(?!.*\.{2})[a-z0-9\-\_\'\.]+$/i)) {
    return 'must be a valid username';
  }
};

export type Username = string;
const UsernameType = (reify: Type<Username>);
UsernameType.addConstraint(isUsername);

export type UserRoleTitle =
  | 'Teacher or School Staff Member'
  | 'Parent'
  | 'School Student'
  | 'School Director'
  | 'Journalist / Media';

export type UserRole = {
  description: string,
  title: UserRoleTitle
};

export type UserRegisterInfo = {
  email: Email,
  firstName?: string,
  lastName?: string,
  password: Password,
  username: Username
};

export type UserSocial = {
  facebook: string,
  googlePlus: string,
  linkedin: string,
  twitter: string,
  website: string,
  youtube: string
};

export type UserMore = {
  avatar?: Attachment,
  bio?: string,
  first_login: boolean,
  firstName?: string,
  head_pic?: Attachment,
  lastName?: string,
  mute_all_posts?: boolean,
  roles?: Array<UserRole>,
  social?: UserSocial,
  summary?: string
};

export type UserRecentTags = {
  geotags: Array<Geotag>,
  hashtags: Array<Hashtag>,
  schools: Array<School>
};

export type User = {
  created_at: DateString,
  followed_geotags?: Array<Geotag>,
  followed_hashtags?: Array<Hashtag>,
  followed_schools?: Array<School>,
  fullName?: string,
  gravatarHash?: string,
  id: UserId,
  liked_geotags?: Array<Geotag>,
  liked_hashtags?: Array<Hashtag>,
  liked_schools?: Array<School>,
  more: UserMore,
  updated_at: DateString,
  username: Username
};

export type MapOfUsers = Map<UserId, User>;

export type CurrentUser = {
  favourites?: Array<Uuid4>, // TODO: use PostId
  followed_geotags: Map<UrlNode, Geotag>,
  followed_hashtags: Map<UrlNode, Hashtag>,
  followed_schools: Map<UrlNode, School>,
  geotags: Array<Geotag>,
  hashtags: Array<Hashtag>,
  id?: UserId,
  liked_geotags: Map<UrlNode, Geotag>,
  liked_hashtags: Map<UrlNode, Hashtag>,
  liked_schools: Map<UrlNode, School>,
  likes?: Array<Uuid4>, // TODO: use PostId
  recent_tags: UserRecentTags,
  schools: Array<School>,
  suggested_users: Array<User>,
  user?: User
};

// recursive
export type RawUser = {
  created_at: DateString,
  followers: Array<RawUser>,
  following: Array<RawUser>,
  fullName?: string,
  gravatarHash: string,
  id: UserId,
  more: UserMore,
  updated_at: DateString,
  username: Username
};
