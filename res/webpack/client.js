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
const merge = require('lodash/merge');

const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const ZopfliPlugin = require('zopfli-webpack-plugin');

const baseConfiguration = require('./base');
const rules = require('./rules');

const
  context = baseConfiguration.context,
  NODE_ENV = process.env.NODE_ENV,
  __DEV__  = NODE_ENV !== 'production';

const clientConfiguration = merge({}, baseConfiguration, {
  output: {
    filename: __DEV__ ? 'assets/[name].js' : 'assets/[name]-[chunkhash].js',
    path: `${context}/public`
  },
  module: {
    rules: [
      ...rules.clientLibFixes(),
      ...rules.clientJS(__DEV__, context),
      ...rules.css(__DEV__),
      ...rules.less(__DEV__, context),
      ...rules.fonts(__DEV__),
      ...rules.favicons(),
      ...rules.images(),
    ]
  },
  plugins: [
    new webpack.IgnorePlugin(/^ioredis$/),
    new webpack.ContextReplacementPlugin(/moment[\\/]locale$/, /en/),
    new webpack.optimize.CommonsChunkPlugin({
      filename: __DEV__ ? 'assets/[name].js' : 'assets/[name]-[chunkhash].js',
      name: 'manifest',
      minChunks: Infinity
    })
  ],
  target: 'web'
});

if (__DEV__) {
  merge(clientConfiguration, {
    devtool: 'eval',
    entry: {
      app: [
        'babel-polyfill',
        'react-hot-loader/patch',
        'webpack-hot-middleware/client?path=/__webpack_hmr',
        `${context}/src/scripts/app.js`
      ],
      uikit: [
        'babel-polyfill',
        'react-hot-loader/patch',
        'webpack-hot-middleware/client?path=/__webpack_hmr',
        `${context}/src/uikit/scripts.js`
      ]
    },
    plugins: [
      new webpack.DllReferencePlugin({
        context,
        name: 'vendor',
        manifest: require(`${context}/public/vendor-manifest.json`), // eslint-disable-line
        extensions: ['.js', '.jsx']
      }),
      new webpack.NamedChunksPlugin(),
      new webpack.HotModuleReplacementPlugin(),
      new ManifestPlugin({
        fileName: 'webpack-chunks.json',
        writeToFileEmit: true
      })
    ],
    resolve: {
      unsafeCache: true
    }
  });
} else {
  merge(clientConfiguration, {
    entry: {
      app: ['babel-polyfill', `${context}/src/scripts/app.js`],
      uikit: ['babel-polyfill', `${context}/src/uikit/scripts.js`]
    },
    plugins: [
      new webpack.EnvironmentPlugin([
        'API_HOST', 'NODE_ENV', 'MAPBOX_ACCESS_TOKEN',
        'GOOGLE_ANALYTICS_ID', 'GOOGLE_TAG_MANAGER_ID'
      ]),
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false,
          pure_getters: true,
          unsafe: true,
          unsafe_comps: true,
          screw_ie8: true
        },
        exclude: [/\.min\.js$/gi],
        output: {
          comments: false
        },
        sourceMap: false
      }),
      new ExtractTextPlugin({
        filename: path.join('assets/styles/[name]-[contentHash].css'),
        allChunks: true
      }),
      // cannot push to __DEV__-independent config
      // since the ordering makes sense (after ExtractTextPlugin in this case)
      new ManifestPlugin({
        fileName: 'webpack-chunks.json',
        writeToFileEmit: true
      }),
      new webpack.optimize.AggressiveMergingPlugin({
        minSizeReduce: true
      }),
      new ZopfliPlugin({
        algorithm: 'zopfli',
        asset: '[path].gz[query]',
        minRatio: 0.8
      })
    ]
  });
}

module.exports = clientConfiguration;
