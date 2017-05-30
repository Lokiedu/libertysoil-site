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
import type { DateString, Integer, Url, Uuid4 } from './common';

export type BookmarkId = Uuid4;

export type Bookmark = {
  created_at: DateString,
  id: BookmarkId,
  more?: {
    description?: string,
    icon?: string
  },
  ord: Integer,
  title: string,
  updated_at: DateString,
  url: Url,
  user_id?: Uuid4,
};

export type PageMetadata = {
  title: string
};

export type MapOfBookmarks = {
  [id: BookmarkId]: Bookmark
};

export type BookmarkRequest = {
  more: {
    description?: string,
    icon?: string
  },
  ord?: Integer,
  title: string,
  url: string
};
