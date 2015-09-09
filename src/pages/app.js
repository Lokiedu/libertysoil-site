import React from 'react';
import { Provider } from 'react-redux';

import {getStore} from '../store';

export default class App extends React.Component {
  render() {
    return (
      <div className="page">
        <Provider store={getStore()}>
          {this.props.children}
        </Provider>
      </div>
    )
  }
}
