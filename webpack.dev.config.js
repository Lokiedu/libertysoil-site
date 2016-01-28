var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');


module.exports = {
  cache: true,

  entry: [
    'webpack-hot-middleware/client?path=/__webpack_hmr',
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
    publicPath: `http://localhost:8000/assets/`,
    pathinfo: true
  },

  module: {
    postLoaders: [
      // Fix grapheme-breaker
      {
        test: /\.js$/,
        include: /node_modules\/grapheme-breaker/,
        loader: 'transform/cacheable?brfs'
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'transform?envify'
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
          ],
          env: {
            development: {
              presets: ['react-hmre']
            }
          }
        }
      },
      {test: /\.json$/, loader: 'json'},
      {test: /\.css$/, loader: 'style?sourceMap!css?sourceMap'},
      {test: /\.less$/, loader: 'style?sourceMap!css?sourceMap!less?sourceMap'},
      {test: /\.(ttf|eot|woff(2)?)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'url?limit=15000'},
      {test: /\.(png|jpg|svg)$/, loader: 'url?limit=15000'}
    ]
  },

  plugins: [
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new webpack.DefinePlugin({
      __DEV__: true
    })
  ],

  debug: true,
  devtool: 'cheap-module-inline-source-map',
};
