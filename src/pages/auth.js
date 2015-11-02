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
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';

import { login, registerUser } from '../triggers';
import { defaultSelector } from '../selectors';

import Footer from '../components/footer';
import Login from '../components/login';
import Register from '../components/register';
import Header from '../components/header';
import Messages from '../components/messages';


let AlreadyLoggedIn = (props) => {
  let link_copy = 'your feed';
  if (props.is_first_login) {
    link_copy = 'the next step';
  }
  
  return (
  <div className="area">
    <div className="area__body">
      <div className="message">
        <div className="message__body">
          You are logged in. You can proceed to <Link className="link" to="/">{link_copy}</Link>.
        </div>
      </div>
    </div>
  </div>
)};

let AuthContents = (props) => {
  if (props.is_logged_in) {
    return <AlreadyLoggedIn is_first_login={props.is_first_login}/>;
  }

  return (
    <div className="area">
      <div>
        <div className="area__body layout-align_start">
          <Login onLoginUser={props.triggers.login} />
          <Register onRegisterUser={props.triggers.registerUser} />
        </div>
      </div>
    </div>
  );
};

class Auth extends React.Component {
  render() {
    let { current_user, is_logged_in } = this.props;

    let triggers = {login, registerUser};

    let is_first_login = false;
    if (current_user){
      is_first_login = current_user.more.first_login;
    }

    return (
      <div>
        <Header is_logged_in={is_logged_in} current_user={current_user} />
        <div className="page__body">
          <Messages messages={this.props.messages}/>
          <AuthContents is_logged_in={is_logged_in} is_first_login={is_first_login} triggers={triggers}/>
        </div>
        <Footer/>
      </div>
    )
  }
}

export default connect(defaultSelector)(Auth);
