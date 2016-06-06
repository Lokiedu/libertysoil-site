const path = require('path');
const webpack = require('webpack');
const autoprefixer = require('autoprefixer');

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
      { test: /\.json$/, loader: 'json' },
      { test: /\.css$/, loader: 'style?sourceMap!css?sourceMap!postcss' },
      { test: /\.less$/, loader: 'style?sourceMap!css?sourceMap!postcss!less?sourceMap' },
      { test: /\.(ttf|eot|woff(2)?)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'url?limit=15000' },
      { test: /\.(png|jpg|svg)$/, loader: 'url?limit=15000' }
    ]
  },

  plugins: [
    // An appropriate alternative to envify.
    new webpack.EnvironmentPlugin([
      'API_HOST', 'NODE_ENV', 'MAPBOX_ACCESS_TOKEN', 'GOOGLE_ANALYTICS_ID'
    ]),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new webpack.DefinePlugin({
      __DEV__: true
    })
  ],

  postcss: () => {
    return [autoprefixer];
  },

  debug: true,
  devtool: 'cheap-module-inline-source-map'
};
