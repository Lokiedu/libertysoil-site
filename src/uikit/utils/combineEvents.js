export default function combineEvents(reducers, initialState) {
  return (state = initialState, event) => {
    if (Reflect.has(reducers, event.type)) {
      return reducers[event.type](state, event);
    }
    return state;
  };
}
