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
import fs from 'fs';
import { serialize } from 'cookie';
import AWS from 'mock-aws';

import expect from '../../../test-helpers/expect';
import { login } from '../../../test-helpers/api';
import initBookshelf from '../../../src/api/db';
import ApiClient from '../../../src/api/client';
import { API_HOST } from '../../../src/config';
import UserFactory from '../../../test-helpers/factories/user';


let bookshelf = initBookshelf($dbConfig);
let User = bookshelf.model('User');

describe('Client test', () => {
  let client;

  before(async () => {
    client = new ApiClient(API_HOST);
  });

  describe('Base methods', () => {
    it('#GET', async () => {
      let response  = await client.get('/api/v1/test');

      expect(await response.text(), 'to be', 'test message in response');
    });

    it('#HEAD', async () => {
      let response = await client.head('/api/v1/test');

      expect(response.status, 'to be', 200);
    });

    it('#DELETE', async () => {
      let response = await client.del('/api/v1/test');

      expect(await response.text(), 'to be', 'test message in delete response');
    });

    it('#POST', async () => {
      let response = await client.post('/api/v1/test');

      expect(await response.text(), 'to be', 'test message in post response');
    });

    it('#POSTJSON', async () => {
      let response = await client.postJSON('/api/v1/test', {foo: 'bar'});

      expect(await response.text(), 'to be', 'test message in post response');
    });
  });

  it('#checkGeotagExists return false for non existing geotag', async () => {
    let result = await client.checkGeotagExists('nonexistingname');

    expect(result, 'to be false');
  });

  it('#deleteComment works', async () => {
    let result = await client.deleteComment('nonexistingpost', 'nonexistingid');

    expect(result.error, 'to be', 'You are not authorized');
  });

});

describe('Authenticated client test', () => {
  it('#uploadImage works', async () => {
    AWS.mock('S3', 'uploadAsync', () => { return { Location: 's3-mocked-location' }; });

    const file = fs.createReadStream('./test-helpers/bulb.png');
    // const result = await client.uploadImage([file]);

    const userAttrs = UserFactory.build();
    const user = await User.create(userAttrs.username, userAttrs.password, userAttrs.email);

    user.set('email_check_hash', null);
    await user.save(null, { method: 'update' });
    const sessionId = await login(userAttrs.username, userAttrs.password);
    const headers = {
      "cookie": serialize('connect.sid', sessionId)
    };

    const client = new ApiClient(API_HOST, { headers });
    const result = await client.uploadImage([file]);

    expect(result.success, 'to be', true);
  });
});
