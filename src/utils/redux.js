import i from 'immutable';
import { browserHistory } from 'react-router';
import { routerMiddleware } from 'react-router-redux';
import { applyMiddleware, compose, createStore } from 'redux';
import reduxCatch from 'redux-catch';

export const REDUX_ERROR = 'REDUX_ERROR';

function errorHandler(error, getState, failedAction, dispatch) {
  /* eslint-disable no-console */
  console.error(
    `Error happened while applying ${failedAction.type} action to Redux:`,
    error
  );
  console.debug('current state', getState());
  console.debug('last action was', failedAction);
  /* eslint-enable no-console */

  dispatch({
    type: REDUX_ERROR,
    data: {
      message: error.message,
      stack: error.stack,
      file: error.file,
      line: error.line,
      name: error.name,
      failedAction,
    },
  });
}

export function createStoreConfigurer(reducers) {
  return function configureStore(state) {
    if (typeof window === 'undefined') {
      // server-side
      return createStore(
        reducers,
        undefined,
        compose(
          applyMiddleware(reduxCatch(errorHandler))
        )
      );
    }

    const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

    return createStore(
      reducers,
      state ? i.fromJS(state) : undefined,
      composeEnhancers(
        applyMiddleware(reduxCatch(errorHandler)),
        applyMiddleware(routerMiddleware(browserHistory))
      )
    );
  };
}
