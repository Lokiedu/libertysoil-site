import expect from 'unexpected';
import { isString, isPlainObject, merge } from 'lodash';
import { serialize } from 'cookie';
import 'mock-aws';
import sinon from 'sinon';

import initBookshelf from '../src/api/db';
import { TestCache } from '../src/api/utils/cache';

global.$bookshelf = initBookshelf(global.$dbConfig);

const startServer = require('../server').default;
const app = startServer();

// A very basic stubs to make API tests pass without intalling sphinx.
sinon.stub(app.context.sphinx.api);
sinon.stub(app.context.sphinx.ql, 'raw').returns([[null, { Value: 1 }]]);
sinon.stub(app.context.sphinx.ql, 'insert').returns({
  into: sinon.stub().returns({
    toString: sinon.stub().returns('insert into')
  })
});

app.context.cache = new TestCache;

expect.installPlugin(require('unexpected-http'));
expect.installPlugin(require('unexpected-dom'));
expect.installPlugin(require('unexpected-immutable'));
expect.installPlugin(require('unexpected-sinon'));
expect.installPlugin(require('unexpected-date'));

const subjectToRequest = (subject) => {
  if (isString(subject)) {
    return {
      url: subject,
      host: 'localhost',
      port: 8000
    };
  }

  if (isPlainObject(subject) && "url" in subject) {
    let result = {
      url: subject.url,
      host: 'localhost',
      port: 8000
    };

    if ("session" in subject) {
      result = merge(result, {
        headers: {
          "Cookie": serialize('connect.sid', subject.session)
        }
      });
    }

    delete subject["url"];
    delete subject["session"];
    result = merge(result, subject);
    return merge(result, subject);
  }

  throw new Error('Unexpected format of test-subject');
};

expect.addAssertion('to respond with array', function (expect, subject/*, value*/) {
  return expect(subjectToRequest(subject), 'to yield response', {
    body: expect.it('to be an', 'array')
  });
});

expect.addAssertion('to have body array length', function (expect, subject, value) {
  return expect(subjectToRequest(subject), 'to yield response', {
    body: expect.it('to have length', value)
  });
});

const REDIRECT_CODES = [301, 302, 303, 307, 308];

expect.addAssertion('to redirect', function (expect, subject/*, value*/) {
  return expect(subjectToRequest(subject), 'to yield response', {
    statusCode: expect.it('to be one of', REDIRECT_CODES)
  });
});

// protip: it is possible to use expect.it('some assertion') as a `value`
expect.addAssertion('<object> to redirect to <any>', function (expect, subject, value) {
  return expect(subjectToRequest(subject), 'to yield response', {
    statusCode: expect.it('to be one of', REDIRECT_CODES),
    headers: {
      Location: value
    }
  });
});

expect.addAssertion('<object> to respond with status <number>', function (expect, subject, value) {
  return expect(subjectToRequest(subject), 'to yield response', {
    statusCode: value,
  });
});

expect.addAssertion('to open successfully', function (expect, subject/*, value*/) {
  return expect(subjectToRequest(subject), 'to yield response', 200);
});

expect.addAssertion('body to contain', function (expect, subject, value) {
  return expect(subjectToRequest(subject), 'to yield response', {
    body: expect.it('to contain', value)
  });
});

expect.addAssertion('body to [exhaustively] satisfy', function (expect, subject, value) {
  return expect(subjectToRequest(subject), 'to yield response', {
    body: expect.it('to satisfy', value)
  });
});

expect.addAssertion('headers to satisfy', function (expect, subject, value) {
  return expect(subjectToRequest(subject), 'to yield response', {
    headers: expect('to satisfy', value)
  });
});

expect.addAssertion('not to open', function (expect, subject/*, value*/) {
  return expect(subjectToRequest(subject), 'to yield response', {
    statusCode: expect.it('to be greater than or equal to', 400)
  });
});

expect.addAssertion('to open authorized', function (expect, subject/*, value*/) {
  return expect(subjectToRequest(subject), 'to yield response', {
    statusCode: expect.it('not to equal', 403)
  });
});

expect.addAssertion('not to open authorized', function (expect, subject/*, value*/) {
  return expect(subjectToRequest(subject), 'to yield response', 403);
});

expect.addAssertion('to open not found', function (expect, subject/*, value*/) {
  return expect(subjectToRequest(subject), 'to yield response', 404);
});

expect.addAssertion('to fail validation', function (expect, subject) {
  return expect(subjectToRequest(subject), 'to yield response', {
    statusCode: 400,
    body: {
      error: 'api.errors.validation'
    }
  });
});

expect.addAssertion('to fail validation with', function (expect, subject, value) {
  return expect(subjectToRequest(subject), 'to yield response', {
    statusCode: 400,
    body: {
      error: 'api.errors.validation',
      fields: expect.it('to satisfy', value),
    }
  });
});

export default expect;
