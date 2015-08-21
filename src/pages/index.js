import React from 'react';

import Login from '../components/login';
import Register from '../components/register';

export default class Index extends React.Component {
  render() {
    console.log('render index...');

    return (
      <div className="page__body">
        <div className="area">
          <div className="area__body layout-align_start">
            <p>This is an index</p>
            <Login/>
            <Register/>
          </div>
        </div>
      </div>
    )
  }
}
