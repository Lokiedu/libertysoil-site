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
/* global $dbConfig,$bookshelf */
import fs from 'fs';
import { connect } from 'net';

import { serialize } from 'cookie';
import AWS from 'mock-aws';
import { v4 } from 'uuid';
import sinon from 'sinon';

import expect from '../../../test-helpers/expect';
import { login } from '../../../test-helpers/api';
import initBookshelf from '../../../src/api/db';
import ApiClient from '../../../src/api/client';
import { API_HOST } from '../../../src/config';
import UserFactory from '../../../test-helpers/factories/user';


const connectAsync = (...args) => {
  return new Promise(function (resolve, reject) {
    const socket = connect(...args);

    socket.once('connect', function () {
      socket.removeListener('error', reject);
      resolve(socket);
    });

    socket.once('error', function (err) {
      socket.removeListener('connection', resolve);
      reject(err);
    });
  });
};

const bookshelfHelper = initBookshelf($dbConfig);
const User = bookshelfHelper.model('User');

describe('Client test', () => {
  let client;

  before(async () => {
    client = new ApiClient(API_HOST);
  });

  describe('Base methods', () => {
    it('#GET', async () => {
      const response  = await client.get('/api/v1/test');

      expect(await response.text(), 'to be', 'test message in response');
    });

    it('#HEAD', async () => {
      const response = await client.head('/api/v1/test');

      expect(response.status, 'to be', 200);
    });

    it('#DELETE', async () => {
      const response = await client.del('/api/v1/test');

      expect(await response.text(), 'to be', 'test message in delete response');
    });

    it('#POST', async () => {
      const response = await client.post('/api/v1/test');

      expect(await response.text(), 'to be', 'test message in post response');
    });

    it('#POSTJSON', async () => {
      const response = await client.postJSON('/api/v1/test', { foo: 'bar' });

      expect(await response.text(), 'to be', 'test message in post response');
    });
  });

  it('#checkGeotagExists return false for non existing geotag', async () => {
    const result = await client.checkGeotagExists('nonexistingname');

    expect(result, 'to be false');
  });

  it('#deleteComment works', async () => {
    return expect(client.deleteComment('nonexistingpost', 'nonexistingid'), 'to be rejected with', 'You are not authorized');
  });

  describe('#search', () => {
    before(async function () {
      try {
        const port = process.env.SPHINX_PORT_9306_TCP_PORT || 9306;
        const connection = await connectAsync({ port });
        connection.close();
      } catch (e) {
        this.skip();
      }
    });

    it('#search works', async () => {
      return expect(client.search({ q: 'test' }), 'to be rejected with', 'Not Found');
    });
  });

  it('#userInfo works', async () => {
    return expect(client.userInfo('nonexisting'), 'to be rejected with', 'Not Found');
  });

  it('#getSchool correctly handle non existing school call', async () => {
    return expect(client.getSchool('nonexisting'), 'to be rejected with', 'Not Found');
  });

  it('#relatedPosts correctly handle non existing post id ', async () => {
    return expect(client.relatedPosts(v4()), 'to be rejected with', 'Internal Server Error');
  });

  it('#userTags correctly handle non authenticated request', async () => {
    return expect(client.userTags(), 'to be rejected with', 'You are not authorized');
  });

  it('#userLikedPosts correctly handle errors', async () => {
    return expect(client.userLikedPosts(), 'to be rejected with', 'You are not authorized');
  });

  it('#userFavouredPosts correctly handle errors', async () => {
    return expect(client.userFavouredPosts(), 'to be rejected with', 'You are not authorized');
  });

  it('#geotagPosts correctly handle non existing geotag', async () => {
    return expect(client.geotagPosts('nonexistinggeotag'), 'to be rejected with', 'Not Found');
  });

  it('#city correctly handle non existing entity', async () => {
    return expect(client.city('nonexistingcity'), 'to be rejected with', 'Not Found');
  });

  it('#country correctly handle non existing entity', async () => {
    return expect(client.country('nonexistingcountry'), 'to be rejected with', 'Not Found');
  });

  it('#like correctly handle non authenticated request', async () => {
    return expect(client.like(), 'to be rejected with', 'You are not authorized');
  });

  it('#unlike correctly handle non authenticated request', async () => {
    return expect(client.unlike('dummyid'), 'to be rejected with', 'You are not authorized');
  });

  describe('Exception tests', () => {
    let userModel;

    before(() => {
      // stub bookshelf model to simulate exception
      userModel = $bookshelf.model('User');
      sinon.stub(userModel, 'forge').callsFake(() => {
        throw new Error('test');
      });
      sinon.stub($bookshelf, 'model').callsFake(() => {
        return userModel;
      });
    });

    after(() => {
      $bookshelf.model.restore();
      userModel.forge.restore();
    });

    it('should work', async () => {
      return expect(client.getAvailableUsername('test'), 'to be rejected with', 'test');
    });
  });
});

describe('Authenticated client test', () => {
  let user,
    sessionId;

  before(async () => {
    const userAttrs = UserFactory.build();
    user = await User.create(userAttrs.username, userAttrs.password, userAttrs.email);

    user.set('email_check_hash', null);
    await user.save(null, { method: 'update' });
    sessionId = await login(userAttrs.username, userAttrs.password);
  });

  after(async () => {
    await user.destroy();
  });

  it('#uploadImage works', async () => {
    AWS.mock('S3', 'upload', () => {
      return {
        promise() {
          return { Location: 's3-mocked-location' };
        }
      };
    });

    const file = fs.createReadStream('./test-helpers/bulb.png');
    // const result = await client.uploadImage([file]);

    const headers = {
      "cookie": serialize('connect.sid', sessionId)
    };

    const client = new ApiClient(API_HOST, { headers });
    const result = await client.uploadImage([file]);

    expect(result.success, 'to be', true);
  });
});

