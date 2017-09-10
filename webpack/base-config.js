import path from 'path';

import webpack from 'webpack';
import ExtractTextPlugin from 'extract-text-webpack-plugin';

import RuleGenerator from './rules';
import { skipFalsy, strToBool } from './utils';


const { env } = process;
export const opts = {
  dev: strToBool(env.DEV, false),
  prefix: '/'
};

const rules = new RuleGenerator(opts.dev);

const config = {
  context: __dirname,
  performance: { hints: false },
  stats: {
    children: false, modules: false, reasons: false, timings: true, assets: false, chunks: true, cached: false, source: false, chunkOrigins: false
  },
  plugins: skipFalsy([
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': opts.dev ? '"development"' : '"production"',
    }),
    new ExtractTextPlugin({ filename: path.join('assets', 'styles', '[name]-[contentHash].css'), allChunks: true }),
    opts.dev && new webpack.HotModuleReplacementPlugin(),
    opts.dev && new webpack.NoEmitOnErrorsPlugin(),
    new webpack.LoaderOptionsPlugin({
      debug: opts.dev,
      minimize: !opts.dev
    }),
  ]),

  output: {
    devtoolModuleFilenameTemplate: '/[absolute-resource-path]',
    filename: path.join("scripts", opts.dev ? "[name].js" : "[name]-[chunkHash].js"),
    path: path.resolve("public"),
    publicPath: opts.prefix,
  },

  module: {
    rules: [
      rules.commmonLess,
      rules.externalCss,
      rules.componentsLess,
      rules.images,
      rules.favicons,
      ...rules.fonts
    ],
    noParse: /\.min\.js/,
  },

  watchOptions: {
    ignored: /node_modules/
  }
};

export default config;
