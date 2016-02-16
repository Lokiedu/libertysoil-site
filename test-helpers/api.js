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
import fetch from 'node-fetch';
import { parse as parseCookie } from 'cookie';

import { API_URL_PREFIX } from '../src/config'


export const POST_DEFAULT_TYPE = 'short_text';
/**
 * Exchange login/password for session-id
 *
 * @param {String} username
 * @param {String} password
 * @return {String} session-id
 */
export async function login(username, password) {
  let res = await fetch(
    `${API_URL_PREFIX}/session`,
    {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    }
  );

  if (res.status !== 200) {
    throw new Error(`Server response code: ${res.status}`);
  }

  let cookieLines = res.headers.getAll('set-cookie');
  for (let line of cookieLines) {
    let cookies = parseCookie(line);

    if ('connect.sid' in cookies) {
      return cookies['connect.sid'];
    }
  }

  throw new Error('no session-cookie in response');
}
