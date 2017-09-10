import { Map } from 'immutable';
import { combineReducers } from 'redux-immutablejs';

import {
  FETCH_LIST_OF_COMPONENTS__REQUEST,
  FETCH_LIST_OF_COMPONENTS__SUCCESS,
  FETCH_LIST_OF_COMPONENTS__FAILURE,

  FETCH_CODE_OF_COMPONENT__REQUEST,
  FETCH_CODE_OF_COMPONENT__SUCCESS,
  FETCH_CODE_OF_COMPONENT__FAILURE,
} from '../actions';
import combineEvents  from '../utils/combineEvents';

const initialLoadingState = Map({
  componentListAreFetching: false,
  componentAreFetching: false,
});

const loadingReducer = combineEvents({
  [FETCH_LIST_OF_COMPONENTS__REQUEST]: (state) => state.set('componentListAreFetching', true),
  [FETCH_LIST_OF_COMPONENTS__SUCCESS]: (state) => state.set('componentListAreFetching', false),
  [FETCH_LIST_OF_COMPONENTS__FAILURE]: (state) => state.set('componentListAreFetching', false),

  [FETCH_CODE_OF_COMPONENT__REQUEST]: (state) => state.set('componentAreFetching', true),
  [FETCH_CODE_OF_COMPONENT__SUCCESS]: (state) => state.set('componentAreFetching', false),
  [FETCH_CODE_OF_COMPONENT__FAILURE]: (state) => state.set('componentAreFetching', false),
}, initialLoadingState);

const uiReducer = combineReducers(Map({
  loading: loadingReducer,
}));

export default uiReducer;
