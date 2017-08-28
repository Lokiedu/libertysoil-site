/*
 This file is a part of libertysoil.org website
 Copyright (C) 2017  Loki Education (Social Enterprise)

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
import debounce from 'debounce-promise';
import zxcvbn from 'zxcvbn';

import ApiClient from '../../api/client';
import { API_HOST } from '../../config';

export const checkEmailValid = (val) => {
  return val.match(/^[a-z0-9!#$%&"'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i);
};

export function checkNoDigits(val = '') {
  return !/\d/.test(val);
}

export function checkTrimmed(val = '') {
  return val.trim();
}

export const checkUsernameValid = (val) => (
  !/[^0-9a-zA-Z-_'\.]/.test(val)
);

export const isPasswordWeak = (val) => (
  zxcvbn(val).score <= 1
);

export function memoize1(f) {
  let cache = {};

  return Object.assign(
    function (x) {
      if (cache[x] === undefined) {
        cache[x] = f(x);
      }
      return cache[x];
    },
    { resetCache: () => cache = {} }
  );
}

export const debounceCached = (f, timeout = 100) => {
  const memoized = memoize1(f);
  return Object.assign(
    debounce(memoized, timeout),
    { resetCache: memoized.resetCache }
  );
};

const client = new ApiClient(API_HOST);

export const getAvailableUsername = debounceCached(
  (username) => {
    if (!username) {
      return Promise.resolve('');
    }

    return client.getAvailableUsername(username);
  },
  100
);

export const checkEmailNotTaken = debounceCached(email =>
  client.checkEmailTaken(email).then(taken => !taken)
);

export const checkUsernameNotTaken = debounceCached(username =>
  client.checkUserExists(username).then(exists => !exists)
);

export const validatePasswordLength = (password) => {
  if (password && password.length < 8) {
    return false;
  }
  return true;
};

export const validatePasswordRepeat = (passwordRepeat, form) => {
  if ((form.password || form.registerPassword) !== passwordRepeat) {
    return false;
  }
  return true;
};

export const resetValidatorsCache = () => {
  [
    getAvailableUsername,
    checkEmailNotTaken,
    checkUsernameNotTaken
  ].forEach(v => v.resetCache());
};
