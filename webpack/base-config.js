import path from 'path';

import webpack from 'webpack';

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
      'process.env.FACEBOOK_AUTH_ENABLED': !!process.env.FACEBOOK_CLIENT_ID,
      'process.env.GOOGLE_AUTH_ENABLED': !!process.env.GOOGLE_CLIENT_ID,
      'process.env.TWITTER_AUTH_ENABLED': !!process.env.TWITTER_CONSUMER_KEY,
      'process.env.GITHUB_AUTH_ENABLED': !!process.env.GITHUB_CLIENT_ID,
    }),
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
    path: path.join(rules.root, "public"),
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
    noParse: (path) => {
      if (/react.*\.production\.min\.js$/.test(path)) {
        return false;
      }
      return /\.min\.js$/.test(path);
    },
  },
  resolveLoader: {
    alias: {
      "mycssmoduleloader": path.join(rules.root, 'webpack', "/cssmoduleloader.js"),
    }
  },

  resolve: {
    alias: {
      _assets: path.normalize(path.join(rules.root, "src", "_assets")),
      _common: path.normalize(path.join(rules.root, "src", "_common")),
      _root: path.normalize(rules.root),
      'prop-types$': path.join(__dirname, '../src/external/prop-types.js')
    }
  },

  watchOptions: {
    ignored: /node_modules/
  }
};

export default config;
