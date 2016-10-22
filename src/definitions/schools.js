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
import type { DateType, Integer, Map, UrlNode, Uuid4 } from './common';
import type { Attachment } from './attachments';
import type { TagMore } from './tags';

export type SchoolId = Uuid4;

export type School = {
  address1?: string,
  address2?: string,
  city?: string,
  country_id?: Uuid4,
  created_at: DateType,
  description?: string,
  facebook?: string,
  foundation_day?: Integer,
  foundation_month?: Integer,
  foundation_year?: Integer,
  house?: string,
  id: SchoolId,
  images?: Array<Attachment>,
  is_open?: boolean,
  lat?: number,
  lon?: number,
  more?: TagMore,
  name: string,
  number_of_students?: Integer,
  org_membership?: Object,
  phone?: string,
  post_count: Integer,
  postal_code?: string,
  principal_name?: string,
  principal_surname?: string,
  required_languages?: Array<string>,
  teaching_languages?: Array<string>,
  twitter?: string,
  updated_at: DateType,
  url_name: UrlNode,
  website?: string,
  wikipedia?: string
};

export type LightSchool = {
  id: SchoolId,
  name: string,
  url_name: UrlNode
};

export type AnySchool = School | LightSchool;

export type MapOfSchools = Map<SchoolId, School>;
