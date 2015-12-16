/*eslint-env node, mocha */
import uuid from 'uuid';
import expect from '../../test-helpers/expect';
import app from '../../index';

import initBookshelf from '../../src/api/db';
import dbConfig from '../../knexfile';

let bookshelf = initBookshelf(dbConfig['test']);

let User = bookshelf.model('User');

describe('pages that are available for anonym', function () {

  describe('when user is not logged in', function () {
    beforeEach(async function () {
      let user = await new User({
        id: uuid.v4(),
        username: 'john',
        email: 'john@example.com'
      }).save(null, {method: 'insert'});

      // await bookshelf.knex.raw('BEGIN;');

    });

    afterEach(async function () {
      await bookshelf.knex.raw('DELETE FROM users WHERE username=\'john\';');
    });

    it('Url /user/john works', async function () {
      return expect(`/api/v1/user/john`, 'to be 200');
    });
  });

});
