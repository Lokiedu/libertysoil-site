if (process.env.NODE_ENV === 'development') {
  Error.stackTraceLimit = Infinity;
  require('trace');
  require('clarify');
}

const bb = require('bluebird');

require('babel-runtime/core-js/promise').default = bb;
global.Promise = bb;

require("babel-register")({
  ignore: /\/(public|node_modules)\//
});

const { server } = require('universal-webpack');

const settings = require('../server-uwsettings');
const configuration = require('../webpack.config.server.babel').default;

server(configuration, settings);
