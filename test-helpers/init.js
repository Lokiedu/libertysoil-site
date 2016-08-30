require('babel-register');
require('babel-polyfill');

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

process.env.NODE_ENV = 'test';
