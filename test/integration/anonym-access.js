/*eslint-env node, mocha */
/*global $dbConfig */
import uuid from 'uuid';
import sinon from 'sinon';

import expect from '../../test-helpers/expect';
import initBookshelf from '../../src/api/db';


let bookshelf = initBookshelf($dbConfig);
let User = bookshelf.model('User');

describe('pages that are available for anonym', function () {
  before(() => {
    sinon.stub(console, 'error', (warning) => { throw new Error(warning); });
  });

  after(() => {
    console.error.restore();
  });


  describe('when user is not logged in', function () {
    beforeEach(async function () {
      await new User({
        id: uuid.v4(),
        username: 'john',
        more: '{"lastName": "Smith", "firstName": "John", "first_login": false}',
        email: 'john@example.com'
      }).save(null, {method: 'insert'});
    });

    afterEach(async function () {
      await bookshelf.knex.raw('DELETE FROM users WHERE username=\'john\';');
    });

    it('User profile page works', async function () {
      return expect(`/user/john`, 'body to contain', 'John Smith');
    });
  });

});
