import React from 'react';
import {Link} from 'react-router';

import Login from '../components/login';
import Register from '../components/register';

export default class Index extends React.Component {
  render() {
    return (
      <div>
        <p>This is an index</p>
        <Login/>
        <hr/>
        <Register/>
        <hr/>

        <Link to="/list">go to list</Link>
      </div>
    )
  }
}
