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
const webpack = require('webpack');

const context = path.join(__dirname, '../../');

module.exports = {
  entry: {
    vendor: [
      'babel-polyfill',
      // 'babel-runtime',
      'bluebird',
      'classnames',
      'codemirror',
      'debounce-promise',
      'flow-runtime',
      // 'font-awesome',
      'immutable',
      'isomorphic-fetch',
      'leaflet',
      'lodash',
      'memoizee',
      'prop-types',
      'react',
      'react-autosuggest',
      'react-dom',
      'react-helmet',
      'react-hot-loader',
      'react-hot-loader/patch',
      'react-icons/lib/fa',
      'react-icons/lib/md',
      'react-inform',
      'react-linkify',
      'react-router',
      'react-router-redux',
      'react-transition-group',
      'redux',
      'redux-catch',
      'redux-immutablejs',
      'reselect',
      't8on',
      'webpack-hot-middleware',
      'zxcvbn'
    ]
  },
  output: {
    filename: 'assets/[name].js',
    library: '[name]',
    libraryTarget: 'var',
    path: path.join(context, 'public')
  },
  plugins: [
    new webpack.DllPlugin({
      name: '[name]',
      path: path.join(context, 'public/[name]-manifest.json')
    })
  ],
  resolve: {
    extensions: ['.js', '.jsx', '.less', '.css']
  },
  target: 'web'
};
