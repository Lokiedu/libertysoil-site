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
import fs, { accessSync } from 'fs';

import Koa from 'koa';
import { isString } from 'lodash';
import session from 'koa-generic-session';
import redisStore from 'koa-redis';
import convert from 'koa-convert';
import cors from 'kcors';
import serve from 'koa-static';
import bodyParser from 'koa-bodyparser';
import mount from 'koa-mount';
import koaConditional from 'koa-conditional-get';
import koaEtag from 'koa-etag';
import Logger, { createLogger } from 'bunyan';

import t from 't8on';

import createRequestLogger from './src/utils/bunyan-koa-request';
import { initApi } from './src/api/routing';
import initBookshelf from './src/api/db';
import initSphinx from './src/api/sphinx';
import { API_HOST } from './src/config';
import { getRoutes } from './src/routing';

import { DEFAULT_LOCALE } from './src/consts/localization';
import { initState } from './src/store';
import { setLocale } from './src/actions/ui';
import { setCurrentUser, setLikes, setFavourites } from './src/actions/users';

import db_config from './knexfile';  // eslint-disable-line import/default

import { getReactMiddleware } from './src/utils/koa-react';


const exec_env = process.env.NODE_ENV || 'development';
const dbEnv = process.env.DB_ENV || 'development';

const streams = [];

const SUPPORTED_LOCALES = Object.keys(
  require('./src/consts/localization').SUPPORTED_LOCALES
);

for (const locale_code of SUPPORTED_LOCALES) {
  t.setLocale(locale_code, require(`./res/locale/${locale_code}.json`));
}

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

const enforceProperHostMiddleware = async (ctx, next) => {
  const { hostname } = parseUrl(API_HOST);

  if (isString(ctx.request.hostname) && ctx.request.hostname !== hostname) {
    const newUri = `${API_HOST}${ctx.request.originalUrl}`;
    ctx.status = 301;
    ctx.redirect(newUri);
    return;
  }
  await next();
};

const initReduxForMainApp = async (ctx) => {
  const store = initState();

  let locale_code;
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

      if (!data.more) {
        locale_code = DEFAULT_LOCALE;
      } else {
        const code = data.more.lang;
        if (!SUPPORTED_LOCALES.find(c => c === code)) {
          locale_code = DEFAULT_LOCALE;
        } else {
          locale_code = code;
        }
      }
    } catch (e) {
      logger.error(`dispatch failed: ${e.stack}`);
    }
  } else {
    locale_code = DEFAULT_LOCALE;
    store.dispatch(setLocale(DEFAULT_LOCALE));
  }

  const locale_data = { [locale_code]: t.dictionary()[locale_code] };

  return { locale_data, store };
};

const knexConfig = db_config[dbEnv];
const bookshelf = global.$bookshelf || initBookshelf(knexConfig);
const sphinx = initSphinx();
const api = initApi(bookshelf, sphinx);

const app = new Koa();
app.logger = logger;
app.keys = ['libertysoil'];

app.on('error', (e) => {
  logger.warn(e);
});

if (exec_env === 'development') {
  logger.level('debug');

  const webpackMiddleware = require('koa-webpack');
  const webpack = require('webpack');
  const webpackConfig = require('./webpack.dev.config');
  const compiler = webpack(webpackConfig);

  app.use(webpackMiddleware({
    compiler,
    dev: {
      log: logger.debug.bind(logger),
      publicPath: webpackConfig.output.publicPath,
      stats: {
        colors: true
      }
    }
  }));
}

app.use(createRequestLogger({ level: 'info', logger }));
app.use(enforceProperHostMiddleware);

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

app.use(koaConditional());
app.use(koaEtag());

app.use(mount('/api/v1', api));
app.use(serve(`${__dirname}/public/`, { index: false, defer: false }));
app.use(getReactMiddleware(getRoutes, initReduxForMainApp, logger));

export default app;
