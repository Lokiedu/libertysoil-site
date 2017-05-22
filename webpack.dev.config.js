const path = require('path');
const webpack = require('webpack');
const autoprefixer = require('autoprefixer');

module.exports = {
  cache: true,

  entry: [
    'webpack-hot-middleware/client?path=/__webpack_hmr',
    'babel-polyfill',
    './src/less/styles.less',
    './src/less/ui-kit.less',
    './src/scripts/app.js',
  ],

  resolveLoader: {
    alias: {
      'examples-loader': path.resolve(__dirname, './src/utils/webpack-loaders/examples-loader.js'),
      'highlight-import-loader': path.resolve(__dirname, './src/utils/webpack-loaders/highlight-import-loader.js')
    }
  },

  resolve: {
    extensions: ['.js', '.jsx', '.less', '.json', '.md']
  },

  output: {
    path: path.join(__dirname, '/public/assets'),
    filename: '[name].js',
    publicPath: `http://localhost:8000/assets/`
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
      {
        test: /\.md$/,
        exclude: /node_modules/,
        use: ['json-loader', 'examples-loader']
      },
      { test: /\.json$/, loader: 'json-loader' },
      { test: /\.css$/,
        use: [
          { loader: 'style-loader?sourceMap' },
          { loader: 'css-loader?sourceMap' },
          { loader: 'postcss-loader' }
        ]
      },
      { test: /\.less$/,
        exclude: /ui\-kit\.less$/,
        use: [
          { loader: 'style-loader?sourceMap' },
          { loader: 'css-loader?sourceMap' },
          { loader: 'postcss-loader' },
          { loader: 'less-loader?sourceMap' }
        ]
      },
      {
        test: /\.less$/,
        include: /ui\-kit\.less$/,
        use: [
          { loader: 'style-loader',
            options: { attrs: { id: 'ui-kit' } } },
          { loader: 'css-loader',
            options: {
              minimize: {
                discardComments: {
                  remove: comment => !comment.startsWith('KIT') && comment[0] !== '!'
                }
              }
            }
          },
          { loader: 'postcss-loader' },
          { loader: 'less-loader' },
          { loader: 'highlight-import-loader' }
        ]
      },
      { test: /\.(otf|ttf|eot|woff(2)?)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'url-loader?limit=15000' },
      { test: /\.(png|jpg|svg)$/, loader: 'url-loader?limit=15000' }
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
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks: module => (
        module.context && module.context.indexOf('node_modules') !== -1
      )
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'manifest'
    }),
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
          autoprefixer,
        ]
      }
    })
  ],

  context: __dirname,

  devtool: 'cheap-module-inline-source-map'
};
