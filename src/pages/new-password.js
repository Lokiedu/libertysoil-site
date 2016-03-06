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

import ApiClient from '../api/client'
import { API_HOST } from '../config';
import { defaultSelector } from '../selectors';
import { ActionsTrigger } from '../triggers';
import { Link } from 'react-router';
import Footer from '../components/footer';
import Header from '../components/header';
import Messages from '../components/messages';


let SuccessMessage = () => {
  return (
    <div>
      You have successfully changed your password. Please proceed into our <Link className="link" to="/auth">login form </Link>.
    </div>
  );
};

class PasswordForm extends React.Component {
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

  _validatePassword() {
    let errors = this.state.errors;
    let password = this.refs.form.password;

    if (password.value.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    } else {
      errors.password = null;
    }

    this.setState({errors});
  }

  _validatePasswordRepeat() {
    let errors = this.state.errors;
    let { password, password_repeat } = this.refs.form;

    if (password_repeat.value.length > 0 && password.value !== password_repeat.value) {
      errors.password_repeat = 'Passwords do not match';
    } else {
      errors.password_repeat = null;
    }

    this.setState({errors});
  }

  render() {
    let errors = this.state.errors;

    return (
      <form className="password-form" ref="form" onSubmit={this.props.onSubmit} action="" method="post">
        <div className="layout__row">
          <div className="form__row">
            <label className="label label-block label-space" htmlFor="newPassword">New Password</label>
            <input
              className="input input-block"
              id="newPassword"
              name="password"
              onChange={this._validatePassword.bind(this)}
              required="required"
              type="password"
            />
            {errors.password && <div className="validation_error">{errors.password}</div>}

            <label className="label label-block label-space" htmlFor="newPasswordRepeat">Repeat</label>
            <input
              className="input input-block"
              id="newPasswordRepeat"
              name="password_repeat"
              onChange={this._validatePasswordRepeat.bind(this)}
              required="required"
              type="password"
            />
            {errors.password_repeat && <div className="validation_error">{errors.password_repeat}</div>}
          </div>
        </div>
        <div className="layout__row layout layout-align_vertical layout-align_justify">
          <button type="submit" className="button button-wide button-green">Submit</button>
        </div>
      </form>
    );
  }
}


class Form extends React.Component {
  submitHandler = (event) => {
    event.preventDefault();

    let form = event.target;

    const client = new ApiClient(API_HOST);
    const triggers = new ActionsTrigger(client, this.props.dispatch);

    triggers.newPassword(this.props.routeParams.hash, form.password.value, form.password_repeat.value);
  };

  render() {
    let {
      messages
    } = this.props;

    let content = <PasswordForm onSubmit={this.submitHandler} />

    if (this.props.ui.submitNewPassword) {
      content = <SuccessMessage />;
    }

    const client = new ApiClient(API_HOST);
    const triggers = new ActionsTrigger(client, this.props.dispatch);

    return (
      <div>
        <Header />

        <div className="page__body">
          <div className="area">
            <div>
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
          </div>
        </div>

        <Footer/>
      </div>
    );
  }
}

export default connect(defaultSelector)(Form);
