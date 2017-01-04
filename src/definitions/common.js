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
import type { $Refinement } from 'tcomb';

export type Success = {
  success: true
};

export const isInteger = (x: number): boolean => x % 1 === 0;

export type Integer = number & $Refinement<typeof isInteger>;

export const isValidEmail = (x: string): boolean => (
  !!x.match(/^[a-z0-9!#$%&"'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i)
);

export type Email = string & $Refinement<typeof isValidEmail>;

export const isValidDate = (x: string): boolean => (
  new Date(x).toString() !== 'Invalid date'
);

export type DateType = string & $Refinement<typeof isValidDate>;

export const isValidUrl = (x: string): boolean => (
  !!x.match(RegExp(/^[a-z0-9_\.'/:-]+$/i))
);

export type Url = string & $Refinement<typeof isValidUrl>;

export const isValidUrlNode = (x: Url): boolean => (
  !x.match(RegExp(/(:|\/)/))
);

export type UrlNode = Url & $Refinement<typeof isValidUrlNode>;

export const isValidUuid4 = (x: string): boolean => (
  !!x.match(RegExp(/^[a-f0-9]{8}-?[a-f0-9]{4}-?4[a-f0-9]{3}-?[89ab][a-f0-9]{3}-?[a-f0-9]{12}$/i))
);

export type Uuid4 = string & $Refinement<typeof isValidUuid4>;

export type Map<K, T> = { [key: K]: T };
