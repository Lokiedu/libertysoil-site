var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');


const PORT = 8000;

module.exports = {
  cache: true,

  entry: [
    'webpack-hot-middleware/client',
    'babel-polyfill',
    './src/scripts/app.js',
    './src/less/styles.less'
  ],

  resolve: {
    extensions: ['', '.js', '.jsx', '.less']
  },

  output: {
    path: path.join(__dirname, '/public/'),
    filename: 'app.js',
    publicPath: `/assets/`,
    pathinfo: true
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
          ],
          env: {
            development: {
              presets: ['react-hmre']
            }
          }
        }
      },
      {
        test: /\.json$/,
        loader: 'json'
      },
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract('style', 'css?sourceMap')
      },
      {
        test: /\.less$/,
        loader: ExtractTextPlugin.extract('style', 'css?sourceMap!less?sourceMap')
      },
      {
        test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: 'url-loader?limit=10000&minetype=application/font-woff'
      },
      {
        test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: 'file-loader'
      }
    ]
  },

  plugins: [
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new ExtractTextPlugin('styles.css', {
      allChunks: true
    }),
    new webpack.NoErrorsPlugin(),
    new webpack.DefinePlugin({
      __DEV__: true
    })
  ],

  debug: true,
  devtool: 'cheap-module-inline-source-map',

  devMiddleware: {
    hot: true,
    noInfo: false,
    quiet: false,
    lazy: false,
    publicPath: '/assets/',
    contentBase: '/public/',

    stats: {
      colors: true
    }
  }
};
