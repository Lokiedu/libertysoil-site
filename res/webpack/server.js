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
const merge = require('lodash/merge');
const nodeExternals = require('webpack-node-externals');

const baseConfiguration = require('./base');
const rules = require('./rules');

const
  context = baseConfiguration.context,
  NODE_ENV = process.env.NODE_ENV,
  __DEV__  = NODE_ENV !== 'production',
  __SERVER__ = true;

const serverConfiguration = merge({}, baseConfiguration, {
  entry: {
    server: `${context}/server.js`,
  },
  externals: [
    nodeExternals()
  ],
  module: {
    rules: [
      ...rules.serverJS(__DEV__, context),
      ...rules.ejsIndexTemplate(),
      ...rules.images(__SERVER__)
    ]
  },
  node: {
    __dirname: false,
    __filename: false
  },
  output: {
    libraryTarget: 'commonjs2',
    path: `${context}/public/server`
  },
  target: 'node'
});

module.exports = serverConfiguration;
