import i from 'immutable';
import { combineReducers } from 'redux-immutablejs';
import { routerReducer } from 'react-router-redux';

import { createStoreConfigurer } from '../../utils/redux';

import components from './components';
import ui from './uiReducer';


export const reducers = combineReducers(i.Map({
  routing: routerReducer,
  components,
  ui
}));

export const configureStore = createStoreConfigurer(reducers);

// useful for tests
export function getEmptyStore() {
  return configureStore();
}
