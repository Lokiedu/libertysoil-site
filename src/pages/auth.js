import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';

import Footer from '../components/footer';
import Login from '../components/login';
import Register from '../components/register';
import Header from '../components/header';
import Messages from '../components/messages';

class AuthContents extends React.Component {
  render() {
    if (this.props.is_logged_in) {
      return <div className="area__body">
        <div className="message">
          <div className="message__body">
            You're logged in already. You can proceed to <Link to="/" className="header__toolbar_item">your feed</Link>
          </div>
        </div>
      </div>;
    }

    return <div>
      <div className="area__body layout-align_start">
        <Login/>
        <Register/>
      </div>
    </div>
  }
}

class Auth extends React.Component {
  render() {
    let currentUser = this.props.current_user;
    let messages;

    if (this.props.messages.length) {
      messages = <div className="layout layout__space layout-align_center">
        <Messages messages={this.props.messages}/>
      </div>;
    }

    return (
      <div>
        <Header is_logged_in={this.props.is_logged_in} current_user={currentUser} />
        <div className="page__body page__body-rows">
          {messages}
          <div className="area">
            <AuthContents is_logged_in={this.props.is_logged_in} messages={this.props.messages}/>
          </div>
        </div>
        <Footer/>
      </div>
    )
  }
}

function select(state) {
  return state.toJS();
}

export default connect(select)(Auth);
