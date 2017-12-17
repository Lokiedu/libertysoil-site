const bb = require('bluebird');
require('babel-runtime/core-js/promise').default = bb;
global.Promise = bb;

require('../public/server/server')();
