/*eslint-env node, mocha */
/*global $dbConfig */
import uuid from 'uuid';
import expect from 'unexpected';

import initBookshelf from '../../src/api/db';


let bookshelf = initBookshelf($dbConfig);

describe('promise Test', function() {
  describe('User.save Promise', function() {
    let User = bookshelf.model('User');

    beforeEach(async () => {
      await bookshelf.knex('users').del();
    });

    afterEach(async () => {
      await bookshelf.knex('users').del();
    });

    it('should fail on saving user with existing username', async () => {
      let user1 = new User({
        id: uuid.v4(),
        username: 'testuser',
        hashed_password: 'test',
        email: 'test@example.com'
      });

      let user2 = new User({
        id: uuid.v4(),
        username: 'testuser',
        hashed_password: 'test',
        email: 'test@example.com'
      });

      await expect(user1.save(null, {method: 'insert'}), 'to be fulfilled');
      await expect(user2.save(null, {method: 'insert'}), 'to be rejected');
    });
  });
});
