import webpack from 'webpack';
import ZopfliPlugin from "zopfli-webpack-plugin";

import configuration, { opts } from './base-config';
import RuleGenerator from './rules';


const rules = new RuleGenerator(opts.dev);

const clientConfiguration = {
  ...configuration
};

if (opts.dev) {
  clientConfiguration.devtool = 'eval';
}

clientConfiguration.module.rules = [
  ...configuration.module.rules,
  rules.clientJs,
  ...rules.clientLibFixes,
  rules.htmlForDevRender
];

let additionalPlugins = [
  new webpack.IgnorePlugin(/^ioredis$/)
];

if (opts.dev === false) {
  additionalPlugins = [
    ...additionalPlugins,
    new webpack.EnvironmentPlugin([
      'API_HOST', 'NODE_ENV', 'MAPBOX_ACCESS_TOKEN', 'GOOGLE_ANALYTICS_ID', 'GOOGLE_TAG_MANAGER_ID'
    ]),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false, // Suppress uglification warnings
        pure_getters: true,
        unsafe: true,
        unsafe_comps: true,
        screw_ie8: true
      },
      sourceMap: false,
      output: {
        comments: false,
      },
      exclude: [/\.min\.js$/gi] // skip pre-minified libs
    }),
    new webpack.optimize.AggressiveMergingPlugin({ minSizeReduce: true }),
    new ZopfliPlugin({
      asset: "[path].gz[query]",
      algorithm: "zopfli",
      minRatio: 0.8
    })
  ];
}

clientConfiguration.plugins = [
  ...configuration.plugins,
  ...additionalPlugins
];

export default clientConfiguration;
