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

  resolveLoader: {
    alias: {
      'example-loader': path.resolve(__dirname, './src/utils/webpack-loaders/example-loader.js'),
      'highlight-import-loader': path.resolve(__dirname, './src/utils/webpack-loaders/highlight-import-loader.js'),
    }
  },

  resolve: {
    extensions: ['.js', '.jsx', '.less', '.json']
  },

  output: {
    path: path.join(__dirname, '/public/assets'),
    filename: 'app.js',
    publicPath: `/assets/`
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
          ]
        }
      },
      { test: /\.json$/, loader: 'json-loader' },
      { test: /\.css$/, loader: ExtractTextPlugin.extract({ fallbackLoader: 'style-loader', loader: 'css-loader!postcss-loader' }) },
      { test: /\.less$/, loader: ExtractTextPlugin.extract({ fallbackLoader: 'style-loader', loader: 'css-loader!postcss-loader!less-loader' }) },
      { test: /\.(otf|ttf|eot|woff(2)?)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'url-loader?limit=15000' },
      { test: /\.(png|jpg|svg)$/, loader: 'file-loader?name=[hash].[ext]' }
    ]
  },

  node: {
    fs: 'empty',
    module: 'empty',
    net: 'empty',
  },

  plugins: [
    // An appropriate alternative to envify.
    new webpack.EnvironmentPlugin([
      'API_HOST', 'NODE_ENV', 'MAPBOX_ACCESS_TOKEN', 'GOOGLE_ANALYTICS_ID', 'INTERCOM_APP_ID'
    ]),
    new webpack.optimize.OccurrenceOrderPlugin(),
    // new UglifyJSPlugin(),
    new ExtractTextPlugin({
      filename: 'styles.css',
      allChunks: true
    }),
    new webpack.LoaderOptionsPlugin({
      options: {
        context: __dirname,
        postcss: [
          autoprefixer
        ]
      }
    })
  ]
};
