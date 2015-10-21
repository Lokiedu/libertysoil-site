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


let AlreadyLoggedIn = () => (
  <div className="area">
    <div className="area__body">
      <div className="message">
        <div className="message__body">
          You are logged in. You can proceed to <Link className="link" to="/">your feed</Link>.
        </div>
      </div>
    </div>
  </div>
);

let AuthContents = (props) => {
  if (props.is_logged_in) {
    return <AlreadyLoggedIn/>;
  }

  return (
    <div className="area">
      <div>
        <div className="area__body layout-align_start">
          <Login onLoginUser={props.triggers.login} />
          <Register onRegisterUser={props.triggers.registerUser} history={props.history} />
        </div>
      </div>
    </div>
  );
};

class Auth extends React.Component {
  render() {
    let { current_user, is_logged_in, history } = this.props;

    let triggers = {login, registerUser};

    return (
      <div>
        <Header is_logged_in={is_logged_in} current_user={current_user} />
        <div className="page__body page__body-rows">
          <Messages messages={this.props.messages}/>

          <div className="area">
            <AuthContents is_logged_in={is_logged_in} triggers={triggers} history={history}/>
          </div>
        </div>
        <Footer/>
      </div>
    )
  }
}

export default connect(defaultSelector)(Auth);

