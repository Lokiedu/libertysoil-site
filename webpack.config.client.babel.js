import webpack from 'webpack';
import { client_configuration } from 'universal-webpack';

import { opts } from './webpack/base-config';
import baseClientConfiguration from './webpack/client-config';
import settings from './server-uwsettings';  // eslint-disable-line import/default


const clientConfiguration = client_configuration(
  {
    ...baseClientConfiguration,
    entry: {
      "app": ['babel-polyfill', `${__dirname}/src/scripts/app.js`],
      "uikit": ['babel-polyfill', `${__dirname}/src/uikit/scripts.js`],
    },
    plugins: [
      ...baseClientConfiguration.plugins,
      new webpack.ContextReplacementPlugin(/moment[\\/]locale$/, /en/),
      new webpack.optimize.CommonsChunkPlugin({
        name: "vendor",
        minChunks: (module) => /node_modules/.test(module.resource)
      }),
      new webpack.optimize.CommonsChunkPlugin({
        name: "manifest",
        minChunks: Infinity
      }),
    ],
  },
  { ...settings, development: opts.dev, silent: true }
);

export default clientConfiguration;
