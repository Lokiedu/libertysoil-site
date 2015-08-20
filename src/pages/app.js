import React from 'react';
import { Provider } from 'react-redux';

import store from '../store';

export default class App extends React.Component {
  render() {
    return (
      <div>
        <p>Hello, world!</p>
        <Provider store={store}>
          {() => this.props.children}
        </Provider>
      </div>
    )
  }
}
