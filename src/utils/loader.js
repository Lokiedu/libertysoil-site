import { fromJS } from 'immutable';


export class EnterHandler
{
  constructor(store, apiClient) {
    this.store = store;
    this.apiClient = apiClient;
  }

  handle = async (nextState/*, replaceState, callback*/) => {
    let len = nextState.routes.length;

    for (let i = len; i--; i >= 0) {
      let route = nextState.routes[i];

      if ('component' in route && 'fetchData' in route.component) {
        const props = this.store.getState();

        try {
          await route.component.fetchData(nextState.params, props, this.apiClient);
        } catch (e) {
          console.error(e);
        }
      }
    }
  }
}
