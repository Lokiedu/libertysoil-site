import expect from 'unexpected';
import { isString, isPlainObject, merge } from 'lodash';
import { serialize } from 'cookie';

import app from '../index';


expect.installPlugin(require('unexpected-express'));
expect.installPlugin(require('unexpected-dom'));
expect.installPlugin(require('unexpected-immutable'));

let subjectToRequest = (subject) => {
  if (isString(subject)) {
    return subject
  }

  if (isPlainObject(subject) && "url" in subject) {
    let result = {
      url: subject.url
    };

    if ("session" in subject) {
      result = merge(result, {
        headers: {
          "Cookie": serialize('connect.sid', subject.session)
        }});
    }

    delete subject["url"];
    delete subject["session"];
    result = merge(result, subject);
    return merge(result, subject);
  }

  throw new Error('Unexpected format of test-subject')
};

expect.addAssertion('to yield a response of', function (expect, subject, value) {
  return expect(app, 'to yield exchange', {
    request: subjectToRequest(subject),
    response: value
  });
});

expect.addAssertion('to yield an array of length', function (expect, subject, value) {
  return expect(app, 'to yield exchange', {
    request: subjectToRequest(subject)
  }).then(function (context) {
    var body = context.httpResponse.body;

    expect(body, 'to have length', value);
  });
});

// TODO: Expect to yield a redirect to a specific path.
expect.addAssertion('to redirect', function (expect, subject, value) {
  return expect(app, 'to yield exchange', {
    request: subjectToRequest(subject),
    response: {
      statusCode: 307
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

expect.addAssertion('to body satisfy', function (expect, subject, value) {
  return expect(app, 'to yield exchange', {
    request: subjectToRequest(subject)
  }).then(function (context) {
    let body = context.httpResponse.body;
    expect(body, 'to satisfy', value);
  });
});

expect.addAssertion('not to open', function (expect, subject, value) {
  return expect(app, 'to yield exchange', {
    request: subjectToRequest(subject)
  }).then(function (context) {
    const status = context.httpResponse.statusLine.statusCode;
    expect(status, 'not to equal', 200);
  });
});

expect.addAssertion('to open authorized', function (expect, subject, value) {
  return expect(app, 'to yield exchange', {
    request: subjectToRequest(subject)
  }).then(function (context) {
    const status = context.httpResponse.statusLine.statusCode;
    expect(status, 'not to equal', 403);
  });
});

expect.addAssertion('not to open authorized', function (expect, subject, value) {
  return expect(app, 'to yield exchange', {
    request: subjectToRequest(subject)
  }).then(function (context) {
    const status = context.httpResponse.statusLine.statusCode;
    expect(status, 'to equal', 403);
  });
});

expect.addAssertion('to validation fail with', function (expect, subject, value) {
  return expect(app, 'to yield exchange', {
    request: subjectToRequest(subject),
    response: {
      statusCode: 400
    }
  }).then(function (context) {
    let body = context.httpResponse.body;
    expect(value, 'to equal', body.error);
  });
});

export default expect;
