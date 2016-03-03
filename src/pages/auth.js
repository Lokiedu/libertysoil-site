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
import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';

import ApiClient from '../api/client'
import { API_HOST } from '../config';
import { ActionsTrigger } from '../triggers';
import { defaultSelector } from '../selectors';
import Footer from '../components/footer';
import Login from '../components/login';
import Register from '../components/register';
import Header from '../components/header';
import Messages from '../components/messages';


export class Auth extends React.Component {

  constructor() {
    super();
    this.state = { registerClicked: false };
  }

  static propTypes = {
    messages: PropTypes.arrayOf(React.PropTypes.object).isRequired,
    ui: PropTypes.shape({
      registrationSuccess: PropTypes.bool
    }).isRequired
  };

  static async fetchData(params, store) {
    const props = store.getState();
    const currentUserId = props.get('current_user').get('id');
    const isLoggedIn = (currentUserId !== null);

    if (!isLoggedIn) {
      return null;
    }

    const currentUser = props.get('users').get(currentUserId);
    const more = currentUser.get('more');
    const is_first_login = !more || more.get('first_login');

    if (is_first_login) {
      return {status: 307, redirectTo: '/induction'};
    }

    return {status: 307, redirectTo: '/'};
  }

  componentDidMount() {

  }

  hideLogin() {
    const header = ReactDOM.findDOMNode();
    const content = ReactDOM.findDOMNode();



    return this;
  }

  registerClickHandler = (event) => {
    if (this.state.registerClicked) return;

    this.hideLogin()
        .setState({ registerClicked: true });
  };

  render() {
    let { current_user, is_logged_in, messages, ui } = this.props;

    const client = new ApiClient(API_HOST);
    const triggers = new ActionsTrigger(client, this.props.dispatch);

    let renderedMessages;

    if (messages.length) {
      renderedMessages = (
        <div className="page__messages">
          <div className="page__body page__body-small">
            <Messages messages={messages} removeMessage={triggers.removeMessage} />
          </div>
        </div>
      );
    }

    const registration_success = ui.registrationSuccess;


    // also classes: parallax parallax__layer-pseudo parallax__layer-bg_pseudo

    return (
      <div className="page__container-bg font-open_sans font-light ">
        <section className="landing landing-big landing-bg landing-bg_house landing-bg_fixed layout__row-group layout__row-full">
          <Header
            is_logged_in={is_logged_in}
            current_user={current_user}
            className="header-transparent header-transparent_border landing__header-fixed"
          />
          <header className="landing__body landing__body-fixed">
            <p className="layout__row layout__row-small landing__small_title" style={{ position: 'relative', left: 4 }}>Welcome to LibertySoil.org</p>
            <h1 className="landing__subtitle landing__subtitle-narrow">Education change network</h1>
              <Login onLoginUser={triggers.login} />
          </header>
        </section>

        {renderedMessages}

        <div className="page__content page__content-spacing page__content-cloudy layout__row-group">
          <div className="page__body page__body-small">
            <div className="layout__row">
              <Register
                onClick={this.registerClickHandler}
                registration_success={registration_success}
                onShowRegisterForm={triggers.showRegisterForm}
                onRegisterUser={triggers.registerUser}
              />
            </div>
          </div>
        </div>
        <div className="layout__row-group page__content-cloudy">
          <Footer/>
        </div>
      </div>
    );
  }
}

export default connect(defaultSelector)(Auth);
