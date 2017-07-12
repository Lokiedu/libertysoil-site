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
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import noop from 'lodash/noop';

import { ArrayOfMessages as ArrayOfMessagesPropType } from '../prop-types/messages';
import { CurrentUser as CurrentUserPropType } from '../prop-types/users';

import ApiClient from '../api/client';
import { API_HOST } from '../config';
import { ActionsTrigger } from '../triggers';
import { createSelector, currentUserSelector } from '../selectors';
import { attachContextualRoutes, detachContextualRoutes } from '../actions/ui';
import { getRoutesNames } from '../utils/router';

import {
  Page,
  PageMain,
  PageBody,
  PageContent
} from '../components/page';
import ContextualRoutes from '../components/contextual';
import Footer from '../components/footer';
import Login from '../components/login';
import Register from '../components/register';
import Header from '../components/header';
import HeaderLogo from '../components/header-logo';
import Messages from '../components/messages';

export class UnwrappedAuth extends React.Component {
  static displayName = 'UnwrappedAuth';

  static propTypes = {
    current_user: CurrentUserPropType,
    dispatch: PropTypes.func,
    is_logged_in: PropTypes.bool,
    location: PropTypes.shape(),
    messages: ArrayOfMessagesPropType.isRequired,
    ui: PropTypes.shape({
      registrationSuccess: PropTypes.bool
    }).isRequired
  };

  static defaultProps = {
    dispatch: noop,
    location: { hash: '', pathname: '', search: '' }
  };

  static async fetchData(router, store) {
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
      return { status: 307, redirectTo: '/induction' };
    }

    return { status: 307, redirectTo: '/' };
  }

  constructor(props, ...args) {
    super(props, ...args);

    this.triggers = new ActionsTrigger(
      new ApiClient(API_HOST), props.dispatch
    );

    this.handleLogin = this.triggers.login.bind(null, true);
    this.routesProps = {
      '#login': { onSubmit: this.handleLogin }
    };
  }

  componentWillMount() {
    this.props.dispatch(attachContextualRoutes(
      UnwrappedAuth.displayName,
      getRoutesNames(this.props.routes),
      ['#login']
    ));
  }

  componentWillUnmount() {
    this.props.dispatch(detachContextualRoutes(
      UnwrappedAuth.displayName,
      getRoutesNames(this.props.routes)
    ));
  }

  render() {
    const {
      current_user,
      is_logged_in,
      messages,
      ui
    } = this.props;

    let renderedMessages;

    if (!messages.isEmpty()) {
      renderedMessages = (
        <div className="page__messages">
          <div className="page__body page__body-small">
            <Messages messages={messages} removeMessage={this.triggers.removeMessage} />
          </div>
        </div>
      );
    }

    const registration_success = ui.get('registrationSuccess');

    return (
      <div className="font-open_sans font-light">
        <Helmet title="Login to " />
        <section className="landing landing-big landing-bg landing-bg_house">
          <Header
            is_logged_in={is_logged_in}
            current_user={current_user}
            className="header-transparent"
            needAuthBlock={false}
            needIndent={false}
            needMenu={false}
          >
            <HeaderLogo />
          </Header>

          <header className="landing__body">
            <p className="layout__row layout__row-small landing__small_title" style={{ position: 'relative', left: 4 }}>Welcome to LibertySoil.org</p>
            <h1 className="landing__subtitle landing__subtitle-narrow">Education change network</h1>
            <Login onLoginUser={this.handleLogin} />
          </header>
        </section>

        <Page className="page__container-no_spacing page__container-bg">
          <PageMain>
            <PageBody className="page__body-small">
              <PageContent className="page__content-mobile_space">
                {renderedMessages}
                <div className="layout__row">
                  <Register
                    registration_success={registration_success}
                    onShowRegisterForm={this.triggers.showRegisterForm}
                    onRegisterUser={this.triggers.registerUser}
                  />
                </div>
              </PageContent>
            </PageBody>
          </PageMain>
        </Page>

        <Footer />
        <ContextualRoutes
          hash={this.props.location.hash}
          predefProps={this.routesProps}
          scope={UnwrappedAuth.displayName}
        />
      </div>
    );
  }
}

const selector = createSelector(
  currentUserSelector,
  state => state.get('messages').filter(m => m.get('message') !== 'welcome-guest'),
  state => state.get('ui'),
  (current_user, messages, ui) => ({
    messages,
    ui,
    ...current_user
  })
);

const Auth = connect(selector)(UnwrappedAuth);
export default Auth;
