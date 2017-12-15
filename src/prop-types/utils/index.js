/*
if (process.env.NODE_ENV !== 'production') {
  module.exports = require('./type-checkers');
} else {
  module.exports = require('./shims');
}
*/

module.exports = require('./shims');
