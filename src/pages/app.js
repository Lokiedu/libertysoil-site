import React from 'react';
import { Provider } from 'react-redux';

import store from '../store';

export default class App extends React.Component {
  render() {
    return (
      <div className="page">
        <Provider store={store}>
          {() => this.props.children}
        </Provider>
      </div>
    )
  }
}
