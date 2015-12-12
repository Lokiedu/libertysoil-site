import bb from 'bluebird';
import uuid from 'uuid';
import initBookshelf from '../../src/api/db';
import db_config from '../../knexfile';
import expect from 'unexpected';

let bookshelf = initBookshelf(db_config['test']);

describe('promise Test', function() {

  describe('User.save Promise', function() {

    it('should not fail on saving users as first test', async function() {

      let User = bookshelf.model('User');
      let obj = new User({
        id: uuid.v4(),
        username: 'testuser',
        hashed_password: 'test',
        email: 'test@example.com'
      });

      /**
       * Next statement fails with message: Unexpected token obj. Seems like mocha do not understand async nature of
       * bookshelf model.
       */
      await obj.save(null, {method: 'insert'});
      expect(true, 'to be ok');
    });

  });

});
