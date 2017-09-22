import { fromJS, Map } from 'immutable';
import {
  FETCH_LIST_OF_COMPONENTS__SUCCESS,
  FETCH_CODE_OF_COMPONENT__REQUEST,
  FETCH_CODE_OF_COMPONENT__SUCCESS,
} from '../actions';
import combineEvents  from '../utils/combineEvents';

const initialState = Map({});

export default combineEvents({
  [FETCH_LIST_OF_COMPONENTS__SUCCESS]: (state, { componentList }) => state.set('list', fromJS(componentList)),

  [FETCH_CODE_OF_COMPONENT__REQUEST]: (state) => state.delete('component'),
  [FETCH_CODE_OF_COMPONENT__SUCCESS]: (state, { component }) => state.set('component', Map(component)),
}, initialState);
