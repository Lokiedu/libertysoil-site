/*
 This file is a part of libertysoil.org website
 Copyright (C) 2015  Loki Education (Social Enterprise)

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
import urlAssembler from 'url-assembler';
import { API_URL, URL, API_URL_NAMES, URL_NAMES } from '../config';

function getUrl(id, params) {
  return urlAssembler()
    .template(URL[id])
    .param(params)
    .toString();
}

function getApiUrl(id, params = {}) {
  return urlAssembler()
    .template(API_URL[id])
    .param(params)
    .toString();
}

export {
  API_URL_NAMES,
  URL_NAMES,
  getUrl,
  getApiUrl
};
