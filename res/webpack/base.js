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

const
  NODE_ENV = process.env.NODE_ENV,
  __DEV__  = NODE_ENV !== 'production',
  context  = path.join(__dirname, '../../');

// console.log(NODE_ENV);

const baseConfiguration = {
  context,
  module: {
    noParse: (path) => {
      if (/react.*\.production\.min\.js$/.test(path)) {
        return false;
      }
      return /\.min\.js$/.test(path);
    }
  },
  output: {
    filename: '[name].js',
    publicPath: '/'
  },
  performance: {
    hints: false
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(NODE_ENV),
      'process.env.FACEBOOK_AUTH_ENABLED': !!process.env.FACEBOOK_CLIENT_ID,
      'process.env.GOOGLE_AUTH_ENABLED': !!process.env.GOOGLE_CLIENT_ID,
      'process.env.TWITTER_AUTH_ENABLED': !!process.env.TWITTER_CONSUMER_KEY,
      'process.env.GITHUB_AUTH_ENABLED': !!process.env.GITHUB_CLIENT_ID
    }),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.LoaderOptionsPlugin({
      debug: __DEV__,
      minimize: !__DEV__,
      options: {
        context
      }
    })
  ],
  stats: {
    assets: false,
    cached: false,
    children: false,
    chunks: true,
    chunkOrigins: false,
    modules: false,
    reasons: false,
    source: false,
    timings: true
  }
};

if (__DEV__) {
  merge(baseConfiguration, {
    cache: true,
    performance: {
      hints: 'warning'
    },
    resolve: {
      alias: {
        'prop-types$': path.join(context, './src/external/prop-types.js')
      }
    }
  });
}

module.exports = baseConfiguration;
