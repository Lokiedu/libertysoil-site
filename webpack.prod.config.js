const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const autoprefixer = require('autoprefixer');

module.exports = {
  entry: [
    'babel-polyfill',
    './src/scripts/app.js',
    './src/less/styles.less'
  ],

  resolve: {
    extensions: ['', '.js', '.jsx', '.less']
  },

  output: {
    path: path.join(__dirname, '/public/assets'),
    filename: 'app.js',
    publicPath: `/assets/`
  },

  module: {
    postLoaders: [
      // Fix grapheme-breaker
      {
        test: /\.js$/,
        include: /node_modules\/grapheme-breaker/,
        loader: 'transform/cacheable?brfs'
      }
    ],
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel',
        query: {
          cacheDirectory: true,
          presets: [
            'es2015-webpack',
            'react',
            'stage-0'
          ],
          plugins: [
            ['transform-decorators-legacy']
          ]
        }
      },
      { test: /\.json$/, loader: 'json' },
      { test: /\.css$/, loader: ExtractTextPlugin.extract('style', 'css!postcss') },
      { test: /\.less$/, loader: ExtractTextPlugin.extract('style', 'css!postcss!less') },
      { test: /\.(ttf|eot|woff(2)?)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'url?limit=15000' },
      { test: /\.(png|jpg|svg)$/, loader: 'file?name=[hash].[ext]' }
    ]
  },

  plugins: [
    // An appropriate alternative to envify.
    new webpack.EnvironmentPlugin([
      'API_HOST', 'NODE_ENV', 'MAPBOX_ACCESS_TOKEN', 'GOOGLE_ANALYTICS_ID'
    ]),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.optimize.UglifyJsPlugin(),
    new webpack.optimize.DedupePlugin(),
    new ExtractTextPlugin('styles.css', {
      allChunks: true
    })
  ],

  postcss: () => {
    return [autoprefixer];
  }
};
