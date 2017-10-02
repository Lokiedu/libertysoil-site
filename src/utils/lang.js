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
// @flow
import reduce from 'lodash/reduce';
import isPlainObject from 'lodash/isPlainObject';

export function toSpreadArray(obj: Object): Array<Object> {
  return reduce(obj, (arr, value, key): Array<Object> => {
    arr.push({ [key]: value });
    return arr;
  }, []);
}

export function castArray(value: any): Array<any> {
  if (typeof value === 'undefined') {
    return [];
  }
  if (Array.isArray(value)) {
    return value;
  }
  return [value];
}

export function castObject(value: any, fieldName: string): Object {
  if (isPlainObject(value)) {
    return value;
  }

  return { [fieldName]: value };
}

export function removeWhitespace(str: string = ''): string {
  return str
    .trim()               // whitespace from ends
    .split(' ')
    .filter(word => word) // extra whitespace between words
    .join(' ');
}
