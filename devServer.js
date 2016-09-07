import path from 'path';
import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import nodemon from 'nodemon';

import config from './webpack.dev.config';


const MAIN_PORT = 8001;
const DEV_PORT = 8000;

config.output.publicPath = `http://localhost:${DEV_PORT}/assets/`;

const devServer = new WebpackDevServer(webpack(config), {
  contentBase: path.resolve(__dirname, 'public'),
  publicPath: config.output.publicPath,

  hot: true,

  proxy: {
    "**": `http://localhost:${MAIN_PORT}`
  },
  port: DEV_PORT,

  // webpack-dev-middleware options
  noInfo: false,
  quiet: false,
  lazy: false,
  filename: 'app.js',
  watchOptions: {
    aggregateTimeout: 300,
    poll: 1000
  },
  stats: { colors: true }
});

nodemon({
  script: 'index.js',
  execMap: {
    js: 'babel-node'
  },
  ext: 'js',
  verbose: true,
  watch: [
    'src/'
  ]
});

nodemon.on('restart', function (files) {
  console.log('Restarting app due to: ', files);  // eslint-disable-line no-console
});

devServer.listen(DEV_PORT, 'localhost', function (err) {
  if (err) {
    console.error(err);  // eslint-disable-line no-console
    process.exit(1);
  }

  console.log(`Dev server listening at http://localhost:${DEV_PORT}`); // eslint-disable-line no-console
});
