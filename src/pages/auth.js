import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';

import Login from '../components/login';
import Register from '../components/register';
import Header from '../components/header';
import Errors from '../components/errors';

class AuthContents extends React.Component {
  render() {
    if (this.props.is_logged_in) {
      return <div className="area__body layout-align_start">
        <p>You're logged in already. You can proceed to <Link to="/" className="header__toolbar_item">your feed</Link></p>
      </div>;
    }

    return <div className="area__body layout-align_start">
      <Errors messages={this.props.messages}/>
      <Login/>
      <Register/>
    </div>
  }
}

class Auth extends React.Component {
  render() {
    let currentUser = this.props.current_user;

    return (
      <div>
        <Header is_logged_in={this.props.is_logged_in} current_user={currentUser} />
        <div className="page__body">
          <div className="area">
            <AuthContents is_logged_in={this.props.is_logged_in} messages={this.props.messages}/>
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
