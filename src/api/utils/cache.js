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
export class RedisCache {
  client = null;
  defaultTimeout = 60 * 10; // 10 minutes

  constructor(client) {
    this.client = client;
  }

  /**
   * Retruns a cached value if present, otherwise calls `getData`, caches and returns the result.
   * @param {*} key Redis key
   * @param {*} getData
   * @param {*} timeout Cache timeout in seconds
   */
  async getCached(key, getData, timeout) {
    let result = await this.client.getAsync(key);

    if (!result) {
      result = JSON.stringify(await getData());
      this.client.setAsync(key, result, 'EX', timeout || this.defaultTimeout);
    }

    return result;
  }

  async getCachedJson(key, getData, timeout) {
    return JSON.parse(await this.getCached(key, getData, timeout));
  }
}

// For tests, where caching is not needed.
export class TestCache {
  async getCached(key, getData) {
    return JSON.stringify(await getData());
  }

  async getCachedJson(key, getData) {
    return JSON.parse(await this.getCached(key, getData));
  }
}
