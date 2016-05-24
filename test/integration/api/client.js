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
/* eslint-env node, mocha */
/* global $dbConfig */
import expect from '../../../test-helpers/expect';
import ApiClient from '../../../src/api/client';
import { API_HOST } from '../../../src/config';


describe('Client test', () => {
  let client;

  before(async () => {
    client = new ApiClient(API_HOST);
  });

  it('Get method should work', async () => {
    let response  = await client.get('/api/v1/test');

    expect(await response.text(), 'to be', 'test message in response');
  });

  it('Head method should work', async () => {
    let response = await client.head('/api/v1/test');

    expect(response.status, 'to be', 200);
  });

  it('checkGeotagExists return false for non existing geotag', async () => {
    let result = await client.checkGeotagExists('nonexistingname');

    expect(result, 'to be false');
  });
});
