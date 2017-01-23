/*
 This file is a part of libertysoil.org website
 Copyright (C) 2016  Loki Education (Social Enterprise)

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
import { Link } from 'react-router';

import { ArrayOfMessages as ArrayOfMessagesPropType } from '../prop-types/messages';

import ApiClient from '../api/client';
import { API_HOST } from '../config';
import { createSelector } from '../selectors';
import { ActionsTrigger } from '../triggers';

import {
  Page,
  PageMain,
  PageBody,
  PageContent
} from '../components/page';
import Footer from '../components/footer';
import Header from '../components/header';
import Messages from '../components/messages';

const SuccessMessage = () => (
  <div>
    You have successfully changed your password. Please proceed into our <Link className="link" to="/auth">login form </Link>.
  </div>
);

class PasswordForm extends React.Component {
  static propTypes = {
    onSubmit: PropTypes.func
  };

  static defaultProps = {
    onSubmit: () => {}
  };

  constructor(props) {
    super(props);

    this.state = {
      errors: {
        password: null,
        password_repeat: null
      }
    };
  }

  _validatePassword = () => {
    const errors = this.state.errors;
    const password = this.form.password;

    if (password.value.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    } else {
      errors.password = null;
    }

    this.setState({ errors });
  };

  _validatePasswordRepeat = () => {
    const errors = this.state.errors;
    const { password, password_repeat } = this.form;

    if (password_repeat.value.length > 0 && password.value !== password_repeat.value) {
      errors.password_repeat = 'Passwords do not match';
    } else {
      errors.password_repeat = null;
    }

    this.setState({ errors });
  };

  render() {
    const errors = this.state.errors;

    return (
      <form action="" className="password-form" method="post" ref={c => this.form = c} onSubmit={this.props.onSubmit}>
        <div className="layout__row">
          <div className="form__row">
            <label className="label label-block label-space" htmlFor="newPassword">New Password</label>
            <input
              className="input input-block"
              id="newPassword"
              name="password"
              required="required"
              type="password"
              onChange={this._validatePassword}
            />
            {errors.password && <div className="validation_error">{errors.password}</div>}

            <label className="label label-block label-space" htmlFor="newPasswordRepeat">Repeat</label>
            <input
              className="input input-block"
              id="newPasswordRepeat"
              name="password_repeat"
              required="required"
              type="password"
              onChange={this._validatePasswordRepeat}
            />
            {errors.password_repeat && <div className="validation_error">{errors.password_repeat}</div>}
          </div>
        </div>
        <div className="layout__row layout layout-align_vertical layout-align_justify">
          <button className="button button-wide button-green" type="submit">Submit</button>
        </div>
      </form>
    );
  }
}


class PasswordPage extends React.Component {
  static propTypes = {
    messages: ArrayOfMessagesPropType.isRequired
  };

  submitHandler = (event) => {
    event.preventDefault();

    const form = event.target;

    const client = new ApiClient(API_HOST);
    const triggers = new ActionsTrigger(client, this.props.dispatch);

    triggers.newPassword(this.props.routeParams.hash, form.password.value, form.password_repeat.value);
  };

  render() {
    const {
      messages,
      is_logged_in,
      ui
    } = this.props;

    let content = <PasswordForm onSubmit={this.submitHandler} />;

    if (ui.get('submitNewPassword')) {
      content = <SuccessMessage />;
    }

    const client = new ApiClient(API_HOST);
    const triggers = new ActionsTrigger(client, this.props.dispatch);

    return (
      <div>
        <Helmet title="Set New Password for " />
        <Header is_logged_in={is_logged_in} needMenu={false} />

        <Page className="page__container-no_sidebar">
          <PageMain>
            <PageBody>
              <PageContent>
                <div className="area">
                  <Messages messages={messages} removeMessage={triggers.removeMessage} />
                  <div className="area__body layout-align_start">
                    <div className="box box-middle">
                      <header className="box__title">Set new password</header>
                      <div className="box__body">
                        {content}
                      </div>
                    </div>
                  </div>
                </div>
              </PageContent>
            </PageBody>
          </PageMain>
        </Page>

        <Footer />
      </div>
    );
  }
}

const selector = createSelector(
  state => !!state.getIn(['current_user', 'id']),
  state => state.get('messages'),
  state => state.get('ui'),
  (is_logged_in, messages, ui) => ({
    is_logged_in,
    messages,
    ui
  })
);

export default connect(selector)(PasswordPage);
