class DataFetcher {
  store;
  apiClient;

  constructor(store, apiClient) {
    this.store = store;
    this.apiClient = apiClient;
  }

  provideListOfComponents = () =>
    this.apiClient.fetchListOfComponents(this.store.dispatch);

  provideCodeOfComponent = ({ name }) =>
    this.apiClient.fetchCodeOfComponent(this.store.dispatch, name);
}

export default DataFetcher;
