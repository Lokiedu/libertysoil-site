const path = require('path');
const loaderUtils = require('loader-utils');
const glob = require('glob');

/**
 * config:
 * { test: /\.\/components\/[a-zA-Z0-9_-]+\.js/,
 *   
 * }
 * 
 * const examples = require(examples-loader!./components);
 * [
 *   { name: '...', url_name: '...',  }
 * ]
 * 
 * 1. (the loader is specified to fetch example's directory or .js)
 * 2. 
 * 3. analyze README.md:
 *   - separate examples (source code) and Markdown text
 *   - analyze dependencies of source code
 */

module.exports = function (source) {
  if (this.cacheable) {
    this.cacheable();
  }

  const options = loaderUtils.getOptions(this) || {};
  const callback = this.async();

  // if (options.meta) {

  // } else {

  // }

  // try {
  //   const x = glob.sync(path.resolve(__dirname, '../../components/*.js'));
  //     //.map(filepath => path.relative(__dirname, filepath));

  //   this.loadModule('!raw-loader!' + x[0], (e, res) => callback(e, res));
  //   //this.resolve(__dirname, x[0], (e, res) => console.log(e || res) || callback(null, res));
  // } catch (e) {
  //   console.log(e);
  //   callback(e);
  // }

  return source;
};
