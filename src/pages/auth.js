import React from 'react';
import { connect } from 'react-redux';

import Login from '../components/login';
import Register from '../components/register';
import Header from '../components/header';

class Auth extends React.Component {
  render() {
    let currentUser = this.props.users[0];
    console.log('render index...');

    return (
      <div>
        <Header currentUser={currentUser} />
        <div className="page__body">
          <div className="area">
            <div className="area__body layout-align_start">
              <p>This is an index</p>
              <Login/>
              <Register/>
            </div>
          </div>
        </div>
      </div>

    )
  }
}

function select(state) {
  return state.toJS();
}

export default connect(select)(Auth);
