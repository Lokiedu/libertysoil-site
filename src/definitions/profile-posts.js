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
import type { DateType, Uuid4 } from './common';
import type { UserId } from './users';


export type ProfilePostId = Uuid4;

export type ProfilePostType = 'text';

export type ProfilePostMore = {
  // Nothing's here yet.
};

export type ProfilePostDraftData = {
  text?: string,
  type: ProfilePostType
};

export type ProfilePost = {
  created_at: DateType,
  html: string,
  id: ProfilePostId,
  more?: ProfilePostMore,
  text: string,
  type: ProfilePostType,
  updated_at: DateType,
  user_id: UserId
};
