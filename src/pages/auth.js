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

import Suggestions from './suggestions';


let FirstLogin = (props) => {
  return (
  <div className="area">
    <div className="area__body">
      <div className="message">
        <div className="message__body">
          You are now successfully registered and logged in. You can proceed to <Link className="link" to="/induction">the next step</Link>.
        </div>
      </div>
    </div>
  </div>
)};

let AuthForms = (props) => {
  return (
  <div className="area">
    <div>
      <div className="area__body layout-align_start">
        <Login onLoginUser={props.triggers.login} />
        <Register onRegisterUser={props.triggers.registerUser} />
      </div>
    </div>
  </div>
)};

let AuthContents = (props) => {
  let {
    current_user,
    is_logged_in,
    is_first_login,
    triggers,
    messages
  } = props;
  
  if(is_logged_in && !is_first_login){
    return <Suggestions/>;
  }
  
  let content = <FirstLogin/>;

  if (!is_logged_in) {
    content = <AuthForms triggers={triggers}/>;
  }

  return (
    <div>
      <Header is_logged_in={is_logged_in} current_user={current_user} />
      <div className="page__body">
        <Messages messages={messages}/>
        {content}
      </div>
      <Footer/>
    </div>
  );
};

class Auth extends React.Component {
  render() {
    let { current_user, is_logged_in, messages } = this.props;

    let triggers = {login, registerUser};

    let is_first_login = false;
    if (current_user) {

      if (current_user.more) {
        is_first_login = current_user.more.first_login;
      }
    }

    return (
      <AuthContents
        current_user={current_user}
        is_logged_in={is_logged_in}
        is_first_login={is_first_login}
        triggers={triggers}
        messages={messages}
        />
    )
  }
}

export default connect(defaultSelector)(Auth);
