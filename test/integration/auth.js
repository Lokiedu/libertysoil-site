/*eslint-env node, mocha */
import uuid from 'uuid';
import expect from '../../test-helpers/expect';
import app from '../../index';

import initBookshelf from '../../src/api/db';
import dbConfig from '../../knexfile';

let bookshelf = initBookshelf(dbConfig['test']);


// TODO: Implement fixtures or factories.
// TODO: Use https://github.com/marak/Faker.js to generate data.
let Post = bookshelf.model('Post');
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

    it('/s/:school_name/edit redirects to /welcome', async function () {
      let school = await new School({
        name: 'test',
        url_name: 'test.com'
      }).save(null, {method: 'insert'});

      return expect(`/s/${school.attributes.url_name}/edit`, 'to redirect');
    });

    it('/post/edit/:uuid redirects to /welcome', async function () {
      let post = await new Post({
        id: uuid.v4(),
        text: 'Test',
        type: 'test'
      }).save(null, {method: 'insert'});

      return expect(`/post/edit/${post.id}`, 'to redirect');
    });
  });
});
