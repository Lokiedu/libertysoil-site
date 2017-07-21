global.Promise = require('bluebird');
global.Promise.onPossiblyUnhandledRejection((e) => { throw e; });

global.Promise.config({
  // Enable warnings.
  warnings: false,
  // Enable long stack traces.
  longStackTraces: true,
  // Enable cancellation.
  cancellation: true
});

// First require your DOM emulation file (see below)
require('./emulateDom.js');

import db_config from '../knexfile';

const exec_env = process.env.DB_ENV || 'test';
global.$dbConfig = db_config[exec_env];

process.env.NODE_ENV = 'test';

const noop = () => null;

['.css', '.jpg', '.png', '.svg', '.ejs']
  .forEach(ext => require.extensions[ext] = noop);
