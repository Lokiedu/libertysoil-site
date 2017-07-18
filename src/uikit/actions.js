export const FETCH_LIST_OF_COMPONENTS__REQUEST = 'FETCH_LIST_OF_COMPONENTS__REQUEST';
export const FETCH_LIST_OF_COMPONENTS__SUCCESS = 'FETCH_LIST_OF_COMPONENTS__SUCCESS';
export const FETCH_LIST_OF_COMPONENTS__FAILURE = 'FETCH_LIST_OF_COMPONENTS__FAILURE';

export const FETCH_CODE_OF_COMPONENT__REQUEST = 'FETCH_CODE_OF_COMPONENT__REQUEST';
export const FETCH_CODE_OF_COMPONENT__SUCCESS = 'FETCH_CODE_OF_COMPONENT__SUCCESS';
export const FETCH_CODE_OF_COMPONENT__FAILURE = 'FETCH_CODE_OF_COMPONENT__FAILURE';

export const fetchListOfComponentsRequest = () => ({
  type: FETCH_LIST_OF_COMPONENTS__REQUEST
});

export const fetchListOfComponentsSuccess = (componentList) => ({
  type: FETCH_LIST_OF_COMPONENTS__SUCCESS,
  componentList
});

export const fetchListOfComponentsFailure = (error) => ({
  type: FETCH_LIST_OF_COMPONENTS__FAILURE,
  error
});

export const fetchCodeOfComponentRequest = () => ({
  type: FETCH_CODE_OF_COMPONENT__REQUEST
});

export const fetchCodeOfComponentSuccess = (component) => ({
  type: FETCH_CODE_OF_COMPONENT__SUCCESS,
  component
});

export const fetchCodeOfComponentFailure = (error) => ({
  type: FETCH_CODE_OF_COMPONENT__FAILURE,
  error
});
