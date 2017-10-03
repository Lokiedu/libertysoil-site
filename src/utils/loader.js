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
// @flow
import createDebug from 'debug';
import { isPlainObject, isNumber } from 'lodash';
import { browserHistory } from 'react-router';

import type { Store } from 'redux';  // eslint-disable-line import/named
import type {
  nodeCallback, replaceCallback,
  AsyncHandler, handler
} from '../definitions/fetch-data';
import type ApiClient from '../api/client';


let debugCounter = 0;

/**
 * Combines onEnter handlers into one function.
 * The function calls handlers in specified order and returns early
 * if one of the handlers returns true.
 * @param handlers
 * @returns {Function}
 */
export function combineHandlers(...handlers: Array<handler>): AsyncHandler {
  return async (nextState, replace) => {
    for (const handler of handlers) {
      if (handler) {
        const shouldInterrupt = await handler(nextState, replace);
        if (shouldInterrupt === true) {
          break;
        }
      }
    }
  };
}

export function combineHandlersAsync(...handlers: Array<handler>): AsyncHandler {
  return async (nextState, replace, callback) => {
    let callbacksTodo = 0;

    const callbackDecreaser = () => {
      callbacksTodo -= 1;

      if (callbacksTodo === 0) {
        if (callback) {
          callback();
        }
        return;
      }

      if (callbacksTodo < 0) {
        throw new Error('too many callbacks called');
      }
    };

    for (const handler of handlers) {
      if (handler) {
        if (handler.length >= 3) {
          callbacksTodo += 1;

          const shouldInterrupt = await handler(nextState, replace, callbackDecreaser);
          if (shouldInterrupt === true) {
            break;
          }
        } else {
          const shouldInterrupt = await handler(nextState, replace);
          if (shouldInterrupt === true) {
            break;
          }
        }
      }
    }

    if (callbacksTodo === 0 && callback) {
      callback();
    }
  };
}

export class AuthHandler {
  store: Store<*, *>;

  constructor(store: Store<*, *>) {
    this.store = store;
  }

  handle = async (nextState: Object, replace: replaceCallback): Promise<boolean> => {
    const state = this.store.getState();

    if (state.getIn(['current_user', 'id']) === null
      && nextState.location.pathname !== '/all'
    ) {
      if (replace) {
        replace('/all');
      }
      return true;  // interrupt
    }

    return false;
  };
}

export class FetchHandler {
  store: Store<*, *>;
  apiClient: ApiClient;

  status = null;
  redirectTo = null;

  constructor(store: Store<*, *>, apiClient: ApiClient) {
    this.store = store;
    this.apiClient = apiClient;
  }

  handle = async (nextState: Object): Promise<void> => {
    const theDebugCounter = debugCounter++;
    if (theDebugCounter === 999) {
      debugCounter = 0;
    }

    const debug = createDebug(`newfront-ui:FetchHandler:[${theDebugCounter}]`);

    const len = nextState.routes.length;
    debug(`will load data for ${len} components`);

    for (let i = len; i--; i >= 0) {
      const route = nextState.routes[i];

      let component = null;
      if ('getComponent' in route) {
        component = route.getComponent(nextState, () => false);
      } else if ('component' in route) {
        component = route.component;
      }

      if (component && 'fetchData' in component) {
        debug(`#${i}: there's something to load`);
        try {
          const response = await component.fetchData(nextState, this.store, this.apiClient);

          debug(`#${i}: finished loading data`);

          if (isPlainObject(response)) {
            const { status, redirectTo } = response;
            debug(`#${i}: will redirect to ${redirectTo} with status ${status}`);
            this.status = status;
            this.redirectTo = redirectTo;

            if (browserHistory) {
              browserHistory.push(redirectTo);
            }
          } else if (isNumber(response)) {
            debug(`#${i}: setting status to ${response}`);
            this.status = response;
          }
        } catch (e) {
          // FIXME: handle error in a useful fashion (show "Network error" to user, ask to reload page, etc.)
          debug(`#${i}: ERROR loading data: ${e}`);
          console.error(e);  // eslint-disable-line no-console
        }
      }
    }

    debug(`DONE`);
  };

  handleChange = async (oldState: Object, nextState: Object) => {
    return this.handle(nextState);
  };

  handleSynchronously = (
    nextState: Object,
    replace: replaceCallback,
    callback: nodeCallback
  ): void => {
    this.handle(nextState)
      .then(() => {
        if (callback) {
          callback();
        }
      })
      .catch((e) => {
        // FIXME: this should be reported to developers instead (use Sentry?)
        console.error(e);  // eslint-disable-line no-console
        if (callback) {
          callback(e);
        }
      });
  };
}

