/*eslint-env node, mocha */
import uuid from 'uuid';
import expect from '../expect';
import app from '../../index';

import initBookshelf from '../../src/api/db';
import dbConfig from '../../knexfile';

let bookshelf = initBookshelf(dbConfig['test']);


// TODO: Implement fixtures or factories.
// TODO: Use https://github.com/marak/Faker.js to generate data.
let User = bookshelf.model('User');
let Post = bookshelf.model('Post');
let Label = bookshelf.model('Label');
let School = bookshelf.model('School');

describe('routes that are unavailable for guests', function () {
  describe('when user is not logged in', function () {
    beforeEach(async function () {
      await bookshelf.knex.raw('BEGIN;');
    });

    afterEach(async function () {
      await bookshelf.knex.raw('ROLLBACK;');
    });

    let routes = [
      '/',
      '/settings',
      '/settings/password',
      '/settings/followers'
    ];

    routes.forEach(function (route) {
      it(`${route} redirects to /welcome`, async function () {
        return expect(route, 'to redirect');
      });
    });

    it('/user/:username redirects to /welcome', async function () {
      let user = await new User({
        id: uuid.v4(),
        username: 'testuser',
        hashed_password: 'test',
        email: 'test@example.com'
      }).save(null, {method: 'insert'});

      return expect(`/user/${user.attributes.username}`, 'to redirect');
    });
  });
});
