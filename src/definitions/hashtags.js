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
import type { DateString, Integer, Map, UrlNode, Uuid4 } from './common';
import type { TagMore } from './tags';

export type HashtagId = Uuid4;

export type Hashtag = {
  created_at: DateString,
  id: HashtagId,
  more?: TagMore,
  name: UrlNode,
  post_count: Integer,
  updated_at: DateString
};

export type MapOfHashtags = Map<HashtagId, Hashtag>;
