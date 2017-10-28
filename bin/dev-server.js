if (process.env.NODE_ENV === 'production') {
  process.exit(1);
}

process.env.NODE_ENV = 'development';

// Error.stackTraceLimit = Infinity;
require('trace');
require('clarify');

const bb = require('bluebird');
require('babel-runtime/core-js/promise').default = bb;
global.Promise = bb;

require('./utils/hook');
require('./utils/watch');

require('../server')(),
require('../tasks')();
