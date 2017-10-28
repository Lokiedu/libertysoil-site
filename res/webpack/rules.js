/*
 This file is a part of libertysoil.org website
 Copyright (C) 2017  Loki Education (Social Enterprise)

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU Affero General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const omit = require('lodash/omit');

/** Embed font in CSS if dev */
function fontLoader(options, __DEV__) {
  const loaderObject = {};
  loaderObject.options = options;
  if (__DEV__) {
    loaderObject.loader = 'url-loader';
    loaderObject.options.limit = 150000;
  } else {
    loaderObject.loader = 'file-loader';
  }
  return loaderObject;
}

function addSourceMap(loader, __DEV__) {
  if (__DEV__) {
    return {
      ...loader,
      options: {
        ...loader.options,
        sourceMap: true
      }
    };
  }

  return loader;
}

module.exports = {};

module.exports.clientJS = (__DEV__, context) => [{
  test: /\.js?$/,
  include: path.join(context, 'src'),
  exclude: /(node_modules)/,
  loader: 'babel-loader',
  options: {
    ignore: /(node_modules)/,
    presets: [
      'react',
      ['es2015', { modules: false }],
      'stage-1'
    ],
    plugins: (function () {
      const plugins = [
        'syntax-do-expressions',
        'transform-do-expressions',
        'lodash'
      ];

      if (__DEV__) {
        plugins.push(
          'transform-runtime'
          /*, ['flow-runtime', { annotate: false, assert: true, warn: true }] */
        );
      } else {
        plugins.push(
          'transform-react-constant-elements',
          'transform-react-inline-elements'
        );
      }

      return plugins;
    })()
  }
}];

module.exports.clientLibFixes = () => [{
  enforce: 'post',
  test: /\.js$/,
  include: /node_modules\/grapheme-breaker/,
  loader: 'transform-loader/cacheable?brfs'
}];

module.exports.css = (__DEV__) => [{
  test: /\.css$/,
  use: ExtractTextPlugin.extract({
    fallback: 'style-loader',
    publicPath: '../../',
    use: [
      { loader: 'css-loader',
        options: {
          autoprefixer: false,
          calc: false,
          mergeIdents: false,
          mergeRules: false,
          uniqueSelectors: false
        } },
      { loader: 'postcss-loader' }
    ].map(l => addSourceMap(l, __DEV__))
  })
}];

module.exports.ejsIndexTemplate = () => [{
  test: /\/index\.ejs$/,
  loader: 'raw-loader'
}];

module.exports.favicons = () => [{
  test: /\.ico$/,
  loader: 'file-loader',
  options: {
    name: '[name]-[hash].[ext]'
  }
}];

module.exports.fonts = (__DEV__) => {
  const outputName = 'assets/fonts/[name]-[hash].[ext]';
  return [
    { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
      include: /node_modules\/font-awesome/,
      options: {
        mimetype: 'image/svg+xml',
        name: outputName } },
    { test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
      options: {
        mimetype: 'application/font-woff',
        name: outputName } },
    { test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
      options: {
        mimetype: 'application/font-woff2',
        name: outputName } },
    { test: /\.otf(\?v=\d+\.\d+\.\d+)?$/,
      options: {
        mimetype: 'application/x-font-opentype',
        name: outputName } },
    { test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
      options: {
        mimetype: 'application/x-font-truetype',
        name: outputName } },
    { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
      options: {
        mimetype: 'application/vnd.ms-fontobject',
        name: outputName } }
  ].map(rule => ({
    ...omit(rule, ['options']),
    loader: fontLoader(rule.options, __DEV__)
  }));
};

module.exports.images = (__SERVER__) => [{
  test: /\.(png|jpg|gif|svg)(\?v=\d+\.\d+\.\d+)?$/,
  exclude: /node_modules|fonts/,
  loader: 'file-loader',
  options: {
    emitFile: !__SERVER__,
    name: 'assets/images/[name]-[hash].[ext]'
  }
}];

module.exports.less = (__DEV__, context) => [{
  resource: {
    and: [
      { test: /\.less$/ },
      { include: path.join(context, 'src/less') },
    ]
  },
  use: ExtractTextPlugin.extract({
    fallback: 'style-loader',
    publicPath: '../../',
    use: [
      { loader: 'css-loader',
        options: {
          autoprefixer: false,
          calc: false,
          mergeIdents: false,
          mergeRules: false,
          uniqueSelectors: false
        } },
      { loader: 'postcss-loader' },
      { loader: 'less-loader' }
    ].map(l => addSourceMap(l, __DEV__))
  })
}];

module.exports.serverJS = (__DEV__, context) => [{
  test: /\.js?$/,
  include: [
    path.join(context, 'server.js'),
    path.join(context, 'tasks.js'),
    path.join(context, 'src'),
  ],
  exclude: /(node_modules)/,
  loader: 'babel-loader',
  options: {
    ignore: /(node_modules)/,
    presets: ["react"],
    plugins: (() => {
      const plugins = [
        "syntax-class-properties",
        "syntax-do-expressions",
        "syntax-dynamic-import",
        "syntax-object-rest-spread",
        "transform-do-expressions",
        "transform-object-rest-spread",
        "transform-class-properties",
        "lodash"
      ];

      /*
        if (__DEV__) {
          plugins.push(
            ["flow-runtime", {
              "annotate": false,
              "assert": true,
              "warn": true
            }]
          );
        }
      */

      return plugins;
    })(),
  }
}];
