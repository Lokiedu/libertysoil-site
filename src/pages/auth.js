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

import ApiClient from '../api/client'
import { API_HOST } from '../config';
import { ActionsTrigger } from '../triggers';
import { defaultSelector } from '../selectors';
import Footer from '../components/footer';
import Login from '../components/login';
import Register from '../components/register';
import Header from '../components/header';
import Messages from '../components/messages';

import Suggestions from './suggestions';


let FirstLogin = () => {
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
        <Register onRegisterUser={props.triggers.registerUser} registration_success={props.registration_success} onShowRegisterForm={props.triggers.showRegisterForm} />
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
    messages,
    registration_success
  } = props;

  if(is_logged_in && !is_first_login){
    return <Suggestions/>;
  }

  let content = <FirstLogin/>;

  if (!is_logged_in) {
    content = <AuthForms triggers={triggers} registration_success={registration_success}/>;
  }

  return (
    <div>
      <div className="page__container-bg">
        <section className="landing landing-big landing-bg landing-bg_house">
          <Header
            is_logged_in={is_logged_in}
            current_user={current_user}
            className="header-transparent header-transparent_border"
          />
        <header className="landing__body">
            <p className="layout__row">Welcome to LibertySoil.org</p>
            <h1 className="landing__head landing__head-narrow">Education change network</h1>
            <div className="layout__grid layout-align_end layout__space-double">
                <div className="layout__grid_item">
                  <label className="label label-before_input" htmlFor="loginUsername">User name</label>
                  <div className="input_group">
                    <span className="input_group__before input_group__before-outside micon micon-extra">person</span>
                    <div className="input_group__input">
                      <input className="input input-big" id="loginUsername" required="required" type="text" name="username" placeholder="Username" />
                    </div>
                  </div>
                </div>
                <div className="layout__grid_item">
                  <label className="label label-before_input" htmlFor="loginPassword">Password</label>
                  <div className="input_group">
                    <div className="input_group__input">
                      <input className="input input-big" id="loginPassword" required="required" type="password" name="password" placeholder="Password" />
                    </div>
                    <Link to="/resetpassword" className="link input_group__after input_group__after-outside_bottom">Forgot your password?</Link>
                  </div>
                </div>
                <div className="layout__grid_item">
                  <button className="button button-big button-red">Log in</button>
                </div>
            </div>
          </header>
        </section>
        <div className="page__body page__body-small">
          <Messages messages={messages} removeMessage={triggers.removeMessage} />
          {content}
        </div>
        <Footer/>
      </div>
    </div>
  );
};

class Auth extends React.Component {

  contextTypes: {
    router: React.PropTypes.object.isRequired
  }


  render() {
    let { current_user, is_logged_in, messages, ui } = this.props;

    const client = new ApiClient(API_HOST);
    const triggers = new ActionsTrigger(client, this.props.dispatch);
    const registration_success = ui.registrationSuccess;

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
        registration_success={registration_success}
        />
    )
  }
}

export default connect(defaultSelector)(Auth);
