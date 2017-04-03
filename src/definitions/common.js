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
import t, { reify } from 'flow-runtime';
import type { Type } from 'flow-runtime';

export type Success = {
  success: true
};

export const isInteger = (x: number) => {
  if (x % 1 !== 0) {
    return 'must be a valid integer';
  }
};

export type Integer = number;
const IntegerType = (reify: Type<Integer>);
IntegerType.addConstraint(isInteger);

export const isEmail = (x: string) => {
  if (!x.match(/^[a-z0-9!#$%&"'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i)) {
    return 'must be a valid email address';
  }
};

export type Email = string;
const EmailType = (reify: Type<Email>);
EmailType.addConstraint(isEmail);

export const isDate = (x: string) => {
  if (!x.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:.\d{1,3})?Z$/)) {
    return 'must be a valid date string';
  }
};

export type DateString = string;
const DateStringType = (reify: Type<DateString>);
DateStringType.addConstraint(isDate);

export const isUrl = (x: string) => {
  if (!x.match(RegExp(/^[a-z0-9_\.'/:-]+$/i))) {
    return 'must be a valid URL';
  }
};

export type Url = string;
const UrlType = (reify: Type<Url>);
UrlType.addConstraint(isUrl);

export const isUrlNode = (x: Url) => {
  if (!x.match(RegExp(/(:|\/)/))) {
    return 'must be a valid URL node';
  }
};

export type UrlNode = Url;
const UrlNodeType = (reify: Type<UrlNode>);
UrlNodeType.addConstraint(isUrlNode);

export const isUuid4 = (x: string) => {
  if (!x.match(RegExp(/^[a-f0-9]{8}-?[a-f0-9]{4}-?4[a-f0-9]{3}-?[89ab][a-f0-9]{3}-?[a-f0-9]{12}$/i))) {
    return 'must be a valid UUID v4 string';
  }
};

export type Uuid4 = string;
const Uuid4Type = (reify: Type<Uuid4>);
Uuid4Type.addConstraint(isUuid4);

export type Map<K, T> = { [key: K]: T };
