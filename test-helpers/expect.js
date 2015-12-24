import expect from 'unexpected';
import { isString, isPlainObject } from 'lodash';
import { serialize } from 'cookie';

import app from '../index';


expect.installPlugin(require('unexpected-express'));

let subjectToRequest = (subject) => {
  if (isString(subject)) {
    return subject
  }

  if (isPlainObject(subject) && "url" in subject && "session" in subject) {
    return {
      url: subject.url,
      headers: {
        "Cookie": serialize('connect.sid', subject.session)
      }
    };
  }

  throw new Error('Unexpected format of test-subject')
};

expect.addAssertion('to yield a response of', function (expect, subject, value) {
  return expect(app, 'to yield exchange', {
    request: subjectToRequest(subject),
    response: value
  });
});

// TODO: Expect to yield a redirect to a specific path.
expect.addAssertion('to redirect', function (expect, subject, value) {
  return expect(app, 'to yield exchange', {
    request: subjectToRequest(subject),
    response: {
      statusCode: 301
    }
  });
});

expect.addAssertion('to open successfully', function (expect, subject, value) {
  return expect(app, 'to yield exchange', {
    request: subjectToRequest(subject),
    response: {
      statusCode: 200
    }
  });
});

expect.addAssertion('to body contains', function (expect, subject, value) {
  return expect(app, 'to yield exchange', {
    request: subjectToRequest(subject),
    response: {
      statusCode: 200
    }
  }).then(function (context) {
    let body = context.httpResponse.body;
    expect(body, 'to contain', value);
  });
});

export default expect;
