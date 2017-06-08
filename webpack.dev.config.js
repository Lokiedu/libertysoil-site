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
    extensions: ['.js', '.jsx', '.less']
  },

  output: {
    path: path.join(__dirname, '/public/assets'),
    filename: 'app.js',
    publicPath: `http://localhost:8000/assets/`,
    pathinfo: true
  },

  module: {
    rules: [
      // Fix grapheme-breaker
      {
        enforce: 'post',
        test: /\.js$/,
        include: /node_modules\/grapheme-breaker/,
        loader: 'transform-loader/cacheable?brfs'
      },
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          cacheDirectory: true,
          presets: [
            ['es2015', { "modules": false }],
            'react',
            'stage-1'
          ],
          env: {
            development: {
              presets: ['react-hmre']
            }
          }
        }
      },
      { test: /\.json$/, loader: 'json-loader' },
      { test: /\.css$/, loader: 'style-loader?sourceMap!css-loader?sourceMap!postcss-loader' },
      { test: /\.less$/, loader: 'style-loader?sourceMap!css-loader?sourceMap!postcss-loader!less-loader?sourceMap' },
      { test: /\.(otf|ttf|eot|woff(2)?)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'url-loader?limit=15000' },
      { test: /\.(png|jpg|svg)$/, loader: 'url-loader?limit=15000' }
    ]
  },

  plugins: [
    // An appropriate alternative to envify.
    new webpack.EnvironmentPlugin([
      'API_HOST', 'NODE_ENV', 'MAPBOX_ACCESS_TOKEN', 'GOOGLE_ANALYTICS_ID', 'GOOGLE_TAG_MANAGER_ID', 'INTERCOM_APP_ID'
    ]),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new webpack.DefinePlugin({
      __DEV__: true
    }),
    new webpack.LoaderOptionsPlugin({
      debug: true,
      options: {
        context: __dirname,
        postcss: [
          autoprefixer
        ]
      }
    })
  ],

  devtool: 'cheap-module-inline-source-map'
};
