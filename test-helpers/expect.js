import expect from 'unexpected';
import app from '../index';

expect.installPlugin(require('unexpected-express'));

expect.addAssertion('to yield a response of', function (expect, subject, value) {
  return expect(app, 'to yield exchange', {
    request: subject,
    response: value
  });
});

// TODO: Expect to yield a redirect to a specific path.
expect.addAssertion('to redirect', function (expect, subject, value) {
  return expect(app, 'to yield exchange', {
    request: subject,
    response: {
      statusCode: 301
    }
  });
});

expect.addAssertion('to open successfully', function (expect, subject, value) {
  return expect(app, 'to yield exchange', {
    request: subject,
    response: {
      statusCode: 200
    }
  });
});

export default expect;
