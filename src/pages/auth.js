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
import Message from '../components/message';

let FirstLogin = () => (
  <Message>
    You are now successfully registered and logged in. You can proceed to <Link className="link" to="/induction">the next step</Link>
  </Message>
);

let AuthContents = (props) => {

  let {
    current_user,
    is_logged_in,
    is_first_login,
    triggers,
    messages,
    registration_success
  } = props;
  let render = {};

  if(is_logged_in && !is_first_login){
    return <Suggestions/>;
  }

  if (messages.length) {
    render.messages = (
      <div className="page__messages">
        <div className="page__body page__body-small">
          <Messages messages={messages} removeMessage={triggers.removeMessage} />
        </div>
      </div>
    );
  }

  render.content = <FirstLogin/>;

  if (!is_logged_in) {
    render.headerLogin = <Login onLoginUser={triggers.login} />;
    render.content = <Register
        onRegisterUser={triggers.registerUser}
        registration_success={registration_success}
        onShowRegisterForm={triggers.showRegisterForm}
      />;
  }

  return (
    <div className="page__container-bg font-light">
      <section className="landing landing-big landing-bg landing-bg_house">
        <Header
          is_logged_in={is_logged_in}
          current_user={current_user}
          className="header-transparent header-transparent_border"
        />
        <header className="landing__body">
            <p className="layout__row">Welcome to LibertySoil.org</p>
            <h1 className="landing__subtitle landing__subtitle-narrow">Education change network</h1>
            {render.headerLogin}
        </header>
      </section>
      {render.messages}
      <div className="page__content page__content-spacing">
        <div className="page__body page__body-small">
          <div className="layout__row">
            {render.content}
          </div>
        </div>
      </div>
      <Footer/>
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
