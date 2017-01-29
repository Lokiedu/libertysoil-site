/*
 This file is a part of libertysoil.org website
 Copyright (C) 2015  Loki Education (Social Enterprise)

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU Affero General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
/*eslint-env node */
import { parse as parseUrl } from 'url';
import path from 'path';
import fs, { accessSync, readFileSync } from 'fs';

import Koa from 'koa';
import { isString } from 'lodash';
import session from 'koa-generic-session';
import redisStore from 'koa-redis';
import convert from 'koa-convert';
import cors from 'kcors';
import serve from 'koa-static';
import bodyParser from 'koa-bodyparser';
import mount from 'koa-mount';
import ejs from 'ejs';
import { promisify } from 'bluebird';
import Logger, { createLogger } from 'bunyan';

import React from 'react';
import { renderToString } from 'react-dom/server';
import { Provider } from 'react-redux';
import { Router, RouterContext, match, createMemoryHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
import Helmet from 'react-helmet';

import createRequestLogger from './src/utils/bunyan-koa-request';
import { getRoutes } from './src/routing';
import { AuthHandler, FetchHandler } from './src/utils/loader';
import { initApi } from './src/api/routing';
import initBookshelf from './src/api/db';
import initSphinx from './src/api/sphinx';
import { API_HOST } from './src/config';
import ApiClient from './src/api/client';

import { initState } from './src/store';
import {
  setCurrentUser, setLikes, setFavourites
} from './src/actions/users';

import db_config from './knexfile';  // eslint-disable-line import/default


const exec_env = process.env.DB_ENV || 'development';

const streams = [];

if (exec_env !== 'test') {
  streams.push({
    stream: process.stderr,
    level: 'info'
  });
}

try {
  accessSync('/var/log', fs.W_OK);

  streams.push({
    type: 'rotating-file',
    path: '/var/log/libertysoil.log',
    level: 'warn',
    period: '1d',   // daily rotation
    count: 3        // keep 3 back copies
  });
} catch (e) {
  // do nothing
}

export const logger = createLogger({
  name: "libertysoil",
  serializers: Logger.stdSerializers,
  src: true,
  streams
});


const app = new Koa();
app.logger = logger;

const knexConfig = db_config[exec_env];
const bookshelf = global.$bookshelf || initBookshelf(knexConfig);
const sphinx = initSphinx();
const api = initApi(bookshelf, sphinx);
const matchPromisified = promisify(match, { multiArgs: true });
const templatePath = path.join(__dirname, '/src/views/index.ejs');
const template = ejs.compile(readFileSync(templatePath, 'utf8'), { filename: templatePath });

app.on('error', (e) => {
  logger.warn(e);
});

if (exec_env === 'development') {
  logger.level('debug');

  const webpackDevMiddleware = require('koa-webpack-dev-middleware');
  const webpackHotMiddleware = require('webpack-koa-hot-middleware').default;
  const webpack = require('webpack');
  const webpackConfig = require('./webpack.dev.config');
  const compiler = webpack(webpackConfig);

  app.use(convert(webpackDevMiddleware(compiler, {
    log: logger.debug.bind(logger),
    path: '/__webpack_hmr',
    publicPath: webpackConfig.output.publicPath,
    stats: {
      colors: true
    }
  })));
  app.use(convert(webpackHotMiddleware(compiler)));
}

app.use(async (ctx, next) => {
  const { hostname } = parseUrl(API_HOST);

  if (isString(ctx.request.hostname) && ctx.request.hostname !== hostname) {
    const newUri = `${API_HOST}${ctx.request.originalUrl}`;
    ctx.status = 301;
    ctx.redirect(newUri);
    return;
  }
  await next();
});

app.keys = ['libertysoil'];

app.use(cors({
  allowHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept']
}));

app.use(bodyParser());  // for parsing application/x-www-form-urlencoded

app.use(convert(session({
  store: redisStore(
    {
      host: '127.0.0.1',
      port: 6379
    }
  ),
  key: 'connect.sid',
  cookie: { signed: false }
})));

app.use(createRequestLogger({ level: 'info', logger }));

app.use(mount('/api/v1', api));

app.use(serve(`${__dirname}/public/`, { index: false, defer: false }));

app.use(async function reactMiddleware(ctx) {
  const store = initState();

  if (ctx.session && ctx.session.user && isString(ctx.session.user)) {
    try {
      const user = await bookshelf
        .model('User')
        .where({ id: ctx.session.user })
        .fetch({
          require: true,
          withRelated: [
            'following',
            'followed_hashtags',
            'followed_schools',
            'followed_geotags',
            'liked_hashtags',
            'liked_geotags',
            'liked_schools',
            'post_subscriptions'
          ]
        });

      const data = user.toJSON();

      const likes = await bookshelf.knex
        .select('post_id')
        .from('likes')
        .where({ user_id: ctx.session.user });

      const favourites = await bookshelf.knex
        .select('post_id')
        .from('favourites')
        .where({ user_id: ctx.session.user });

      store.dispatch(setCurrentUser(data));
      store.dispatch(setLikes(data.id, likes.map(like => like.post_id)));
      store.dispatch(setFavourites(data.id, favourites.map(fav => fav.post_id)));
    } catch (e) {
      logger.error(`dispatch failed: ${e.stack}`);
    }
  }

  const authHandler = new AuthHandler(store);
  const fetchHandler = new FetchHandler(store, new ApiClient(API_HOST, ctx));
  const Routes = getRoutes(authHandler.handle, fetchHandler.handleSynchronously);

  const makeRoutes = (history) => (
    <Router history={history}>
      {Routes}
    </Router>
  );

  const history = syncHistoryWithStore(createMemoryHistory(), store, { selectLocationState: state => state.get('routing') });
  const routes = makeRoutes(history);

  try {
    const [redirectLocation, renderProps] = await matchPromisified({ routes, location: ctx.url });

    if (redirectLocation) {
      ctx.status = 307;
      ctx.redirect(redirectLocation.pathname + redirectLocation.search);
      return;
    }

    if (renderProps == null) {
      ctx.status = 404;
      ctx.body = 'Not found';
      return;
    }

    if (fetchHandler.redirectTo !== null) {
      ctx.status = fetchHandler.status;
      ctx.redirect(fetchHandler.redirectTo);
      return;
    }

    try {
      const html = renderToString(
        <Provider store={store}>
          <RouterContext {...renderProps} />
        </Provider>
      );
      const state = JSON.stringify(store.getState().toJS());

      if (fetchHandler.status !== null) {
        ctx.status = fetchHandler.status;
      }

      // we always render Helmet's metadata as tags like <title></title>
      Helmet.canUseDOM = false;
      const metadata = Helmet.rewind();

      ctx.staus = 200;
      ctx.body = template({ state, html, metadata });
    } catch (e) {
      logger.error(e);
      ctx.status = 500;
      ctx.body = e.message;
    }
  } catch (e) {
    logger.error(e);
    ctx.status = 500;
    ctx.body = e.message;
  }
});

export default app;
