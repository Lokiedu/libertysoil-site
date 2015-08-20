import React from 'react';

import Login from '../components/login';
import Register from '../components/register';

export default class Index extends React.Component {
  render() {
    console.log('render index...');

    return (
      <div>
        <p>This is an index</p>
        <Login/>
        <hr/>
        <Register/>
        <hr/>
      </div>
    )
  }
}
