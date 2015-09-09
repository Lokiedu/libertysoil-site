import React from 'react';
import { connect } from 'react-redux';

import Login from '../components/login';
import Register from '../components/register';
import Header from '../components/header';

class Auth extends React.Component {
  render() {
    let currentUser = this.props.current_user;

    return (
      <div>
        <Header is_logged_in={this.props.is_logged_in} current_user={currentUser} />
        <div className="page__body">
          <div className="area">
            <div className="area__body layout-align_start">
              <p>This is an index</p>
              {!this.props.is_logged_in && <Login />}
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
