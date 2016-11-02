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
const DEFAULT_TIMEOUT = 10000;

/**
 * Returns a promise, which is resolved if "callback" returns an error before timeout
 * and which is rejected if there's no value in time
 * @param callback
 * @param timeout
 * @returns {Promise}
 */
export function waitForCallback(callback, timeout = DEFAULT_TIMEOUT) {
  let result = undefined;

  const start = Date.now();

  const promise = new Promise((resolve, reject) => {
    const iteration = () => {
      try {
        result = callback();
        resolve(result);
      } catch (e) {
        if (Date.now() - start > timeout) {
          reject(new Error(`Callback did not succeed in ${timeout} ms`));
          return;
        }

        setTimeout(iteration, 50);
      }
    };

    iteration();
  });

  return promise;
}

/**
 * Returns a promise, which is resolved as soon as "callback" returns True.
 * and which is rejected if it doesn't do this in time
 * @param callback
 * @param timeout
 * @returns {Promise}
 */
export function waitForTrue(callback, timeout = DEFAULT_TIMEOUT) {
  const handler = () => {
    const result = callback();

    if (result !== true) {
      throw new Error();
    }
  };

  return waitForCallback(handler, timeout);
}

/**
 * Calls "callback()", stores initial value. Returns a promise, which is resolved as soon as value returned by
 * callback is different from the one stored, and which is rejected if it doesn't happen in time.
 * @param callback
 * @param timeout
 * @returns {Promise}
 */
export function waitForChange(callback, timeout = DEFAULT_TIMEOUT) {
  const initialValue = callback();

  const handler = () => {
    const newValue = callback();

    if (newValue === initialValue) {
      throw new Error();
    }

    return newValue;
  };

  return waitForCallback(handler, timeout);
}
