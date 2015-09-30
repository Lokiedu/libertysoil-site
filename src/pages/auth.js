import React from 'react';
import { connect } from 'react-redux';
/*
 This file is a part of libertysoil.org website
 Copyright (C) 2015  Loki Education (Social Enterprise)

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU Affero General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
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
    let current_user = this.props.users[this.props.current_user];
    let messages;

    if (this.props.messages.length) {
      messages = <div className="layout layout__space layout-align_center">
        <Messages messages={this.props.messages}/>
      </div>;
    }

    return (
      <div>
        <Header is_logged_in={this.props.is_logged_in} current_user={current_user} />
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
