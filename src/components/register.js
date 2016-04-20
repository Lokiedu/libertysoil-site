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
import React, { Component, PropTypes } from 'react';
import { form as inform } from 'react-inform';
import ga from 'react-google-analytics';

import ApiClient from '../api/client';
import { API_HOST } from '../config';
import Message from './message';

class SuccessContent extends Component {

  clickHandler = (event) => {
    event.preventDefault();
    this.props.onShowRegisterForm();
  };

  render() {
    return (
      <div className="box box-middle">
        <header className="box__title">Registration success</header>
          <div className="box__body">
            <div className="layout__row">
        <div>Please check your email for further instructions. Or <a href="#" className="link" onClick={this.clickHandler}>display register form.</a></div>
            </div>

          </div>
      </div>
    );
  }
}

class Register extends React.Component {
  static displayName = 'Register';

  static propTypes = {
    fields: PropTypes.shape({
      username: PropTypes.shape({
        error: PropTypes.string
      }).isRequired,
      password: PropTypes.shape({
        error: PropTypes.string
      }).isRequired,
      passwordRepeat: PropTypes.shape({
        error: PropTypes.string
      }).isRequired,
      email: PropTypes.shape({
        error: PropTypes.string
      }).isRequired,
      agree: PropTypes.shape({
        error: PropTypes.string
      }).isRequired
    }).isRequired,
    form: PropTypes.shape({
      forceValidate: PropTypes.func.isRequired,
      isValid: PropTypes.func.isRequired,
      onValues: PropTypes.func.isRequired
    }).isRequired
  };

  submitHandler = (event) => {
    event.preventDefault();

    const { fields, form } = this.props;

    form.forceValidate();

    if (!form.isValid()) {
      return;
    }

    let theForm = event.target;

    this.props.onRegisterUser(
      form.username.value,
      form.password.value,
      form.email.value,
      theForm.firstName.value,
      theForm.lastName.value
    );
  };

  constructor() {
    super();

    this.first = '';
    this.last = '';
    this.usernameManuallyChanged = false;
    this.state = {
      username: ''
    };
  }

  async getAvailableUsername(username) {
    const client = new ApiClient(API_HOST);
    return await client.getAvailableUsername(username);
  }

  inputHandler = async (event) => {
    if (this.usernameManuallyChanged)
      return;

    const field = event.target;
    const input = field.value.replace(/\W|\d/g, '');

    if (field.getAttribute('name') === 'firstName') {
      this.first = input;
    } else if (field.getAttribute('name') === 'lastName') {
      this.last = input;
    }
    
    const result = this.first + this.last;
    if (!result) {
      this.setState({ username: result });
      return;
    }

    try {
      this.setState({ username: await this.getAvailableUsername(result) });
      this.error = '';
    } catch (e) {
      this.error = e.message;
    }

    console.log(this.state.username);
  };

  inputUsername = async (event) => {
    const result = event.target.value.replace(/\s|\W/g, '');

    this.setState({ username: result });
    this.usernameManuallyChanged = true;
  };

  render() {
    const { fields, form } = this.props;

    if (this.props.registration_success) {
      ga('send', 'event', 'Reg', 'Done');
      return ( <SuccessContent onShowRegisterForm={this.props.onShowRegisterForm} /> );
    }

    const reset = ((e) => e.target.setCustomValidity(''));
    console.log(fields.username);
    return (
    <div id="register" className="div">
      <header className="layout__row layout__row-double">
        <p className="layout__row content content-small">Create new account</p>
        <div className="layout__row content__head">Be the change</div>
        <div className="layout__row content content-small">
          <p>Connect with parents and education professionals from around the world to make education better for all children in all schools and families worldwide.</p>
        </div>
      </header>
      <form action="" onSubmit={this.submitHandler} className="layout__row">
          <div className="layout__row"><div className="layout__row layout__row-double">
            <label className="label label-before_input" htmlFor="registerFirstName">First name</label>
            <input onBlur={reset} onInput={this.inputHandler} className="input input-gray input-big input-block" type="text" placeholder="Firstname" id="registerFirstName" name="firstName" />
          </div>
          <div className="layout__row layout__row-double">
            <label className="label label-before_input" htmlFor="registerLastName">Last name</label>
            <input onBlur={reset} onInput={this.inputHandler} className="input input-gray input-big input-block" type="text" placeholder="Lastname" id="registerLastName" name="lastName" />
          </div>
          <div className="layout__row layout__row-double">
            <label className="label label-before_input" htmlFor="username">Username</label>
            <input ref={(c) => this.username = c} className="input input-gray input-big input-block" type="text" placeholder="Username" id="username" name="username" required="required" onChange={this.inputUsername} value={this.state.username} {...fields.username}/>
            {fields.username.error &&
              <Message message={fields.username.error} />
            }
          </div>
          <div className="layout__row layout__row-double">
            <label className="label label-before_input" htmlFor="registerPassword">Password</label>
            <input ref={(c) => this.password = c} onInput={this.passwordValidation} className="input input-gray input-big input-block" type="password" id="registerPassword" name="password" required="required" {...fields.password} />
            {fields.password.error &&
              <Message message={fields.password.error} />
            }
          </div>
          <div className="layout__row layout__row-double">
            <label className="label label-before_input" htmlFor="registerPasswordRepeat">Repeat password</label>
            <input ref={(c) => this.passwordRepeat = c} onInput={this.passwordValidation} className="input input-gray input-big input-block" type="password" id="registerPasswordRepeat" name="password_repeat" required="required" {...fields.passwordRepeat} />
            {fields.passwordRepeat.error &&
              <Message message={fields.passwordRepeat.error} />
            }
          </div>
          <div className="layout__row layout__row-double">
            <label className="label label-before_input label-space" htmlFor="registerEmail">Email</label>
            <input ref={(c) => this.email = c} onChange={this.emailValidation} className="input input-gray input-big input-block" type="email" placeholder="email.address@example.com" id="registerEmail" name="email" required="required" {...fields.email} />
            {fields.email.error &&
              <Message message={fields.email.error} />
            }
          </div>
        </div>
        <div className="layout__row layout__row-double">
          {fields.agree.error &&
            <Message message={fields.agree.error} />
          }
          <div className="layout__grid layout__grid-big layout-align_vertical">
            <button className="button button-big button-green">Sign up</button>
            <label className="action checkbox">
              <input name="agree" required="required" type="checkbox" {...fields.agree} />
              <span className="checkbox__label-right">I agree to Terms &amp; Conditions</span>
            </label>
          </div>
        </div>
      </form>
    </div>
    )
  }
}

const checkEmailTaken = async (email) => {
  const client = new ApiClient(API_HOST);
  return await client.checkEmailTaken(email);
};

const checkUserExists = async (username) => {
  const client = new ApiClient(API_HOST);
  return await client.checkUserExists(username);
};

const validateUsername = async (username) => {
  if (!username) {
    return 'Enter your username';
  }

  let taken;
  try {
    taken = await checkUserExists(username);
  } catch (e) {
    return e.message;
  }

  if (taken) {
    return 'Username is taken';
  } else {
    return undefined;
  }
};

const validateEmail = async (email) => {
  if (!email) {
    return 'Enter your email address';
  }

  let taken;
  try {
    taken = await checkEmailTaken(email);
  } catch (e) {
    return e.message;
  }

  if (taken) {
    return 'Email is taken';
  } else {
    return undefined;
  }
}

const validatePassword = (password) => {
  if (password && password.length < 8) {
    return 'Password must contain at least 8 symbols';
  } else {
    return undefined;
  }
};

const validatePasswordRepeat = (password, repeat) => {
  if (password !== repeat) {
    return "Passwords don't match";
  } else {
    return undefined;
  }
};

const fields = ['username', 'password', 'passwordRepeat', 'email', 'agree'];
const validate = async (values) => {
  const {
    username,
    password,
    passwordRepeat,
    email,
    agree
  } = values;
  const errors = {};

  errors.username = await validateUsername(username);
  errors.email = await validateEmail(email);
  errors.password = validatePassword(password);
  errors.passwordRepeat = validatePasswordRepeat(password, passwordRepeat);
  
  if (!agree) {
    errors.agree = 'You have to agree to Terms before registering';
  }

  return errors;
};

const WrappedRegister = inform({
  fields,
  validate
})(Register);

export default WrappedRegister;

