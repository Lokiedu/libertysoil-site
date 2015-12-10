import bb from 'bluebird';
import uuid from 'uuid';
import initBookshelf from '../../src/api/db';
import db_config from '../../knexfile';
let bookshelf = initBookshelf(db_config['test']);

describe('promise Test', function() {

  describe('User.save Promise', function() {

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
    // await obj.save(null, {method: 'insert'});

  });

  describe('Simple bluebird promise', function() {

    let f = () => {
      return new bb((resolve, reject) => {
        return resolve();
      });
    };

    it('should not fail on await keyword', async function() {
      let client = await f();
    });

  });

});
