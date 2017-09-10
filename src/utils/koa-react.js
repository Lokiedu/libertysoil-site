import fs from 'fs';

import React from 'react';
import { renderToString } from 'react-dom/server';
import { Provider } from 'react-redux';
import { promisify } from 'bluebird';
import { Router, RouterContext, match, createMemoryHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
import Helmet from 'react-helmet';
import ejs from 'ejs';

import { API_HOST } from '../config';
import ApiClient from '../api/client';
import templateData from '../views/index.ejs';

import { AuthHandler, FetchHandler } from './loader';

const matchPromisified = promisify(match, { multiArgs: true });
const readFile = promisify(fs.readFile);

let template;
if (['test', 'travis'].includes(process.env.DB_ENV)) {
  template = ejs.compile(fs.readFileSync('src/views/index.ejs', 'utf8'));
} else {
  template = ejs.compile(templateData, { filename: 'index.ejs' });
}

let webpackChunks = null;

export function getReactMiddleware(appName, prefix, getRoutes, reduxInitializer, logger) {
  const reactMiddleware = async (ctx) => {
    if (!webpackChunks) {
      try {
        const data = await readFile('public/webpack-chunks.json');
        webpackChunks = JSON.parse(data);
      } catch (e) {
        logger.error(e);
        ctx.status = 500;
        ctx.body = 'Internal Server Error';
        return;
      }
    }

    const { store, locale_data } = await reduxInitializer(ctx);

    const authHandler = new AuthHandler(store);
    const fetchHandler = new FetchHandler(store, new ApiClient(API_HOST, ctx));
    const Routes = getRoutes(authHandler.handle, fetchHandler.handleSynchronously);

    const makeRoutes = (history) => (
      <Router history={history}>
        {Routes}
      </Router>
    );

    const history = syncHistoryWithStore(createMemoryHistory({ basename: prefix }), store, { selectLocationState: state => state.get('routing') });
    const routes = makeRoutes(history);

    try {
      const [redirectLocation, renderProps] = await matchPromisified({ routes, location: ctx.url });

      if (redirectLocation) {
        ctx.status = 307;
        ctx.redirect(redirectLocation.pathname + redirectLocation.search);
        return;
      }

      if (renderProps === null) {
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
        // Helmet.canUseDOM must be assigned before renderToString.
        // Otherwise Helmet.rewind returns original object on the first run which may break some tests.
        Helmet.canUseDOM = false;

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
        const metadata = Helmet.rewind();
        const gtm = process.env.GOOGLE_TAG_MANAGER_ID || null;
        const localization = JSON.stringify(locale_data);

        const paths = {
          webpackChunks,
        };

        ctx.staus = 200;
        ctx.body = template({ appName, state, html, metadata, gtm, localization, paths });
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
  };

  return reactMiddleware;
}
