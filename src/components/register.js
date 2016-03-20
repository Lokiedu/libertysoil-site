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
import React, { Component } from 'react';
import ga from 'react-google-analytics';

import ApiClient from '../api/client';
import { API_HOST } from '../config';

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

export default class RegisterComponent extends React.Component {
  constructor() {
    super();

    this.first = '';
    this.last = '';
    this.error = '';
    this.unavailable = false;
    this.usernameManuallyChanged = false;
    this.state = {
      username: ''
    };
  }

  submitHandler = (event) => {
    event.preventDefault();

    let form = event.target;

    if (this.error) {
      form.username.setCustomValidity(this.error);
      return;
    }

    if (this.unavailable) {
      return;
    }

    if (form.password.value != form.password_repeat.value) {
      form.password_repeat.setCustomValidity("Passwords don't match");
      return;
    }

    form.password_repeat.setCustomValidity('');

    if (!form.agree.checked) {
      form.agree.setCustomValidity('You have to agree to Terms before registering');
      return;
    }

    this.props.onRegisterUser(
      form.username.value,
      form.password.value,
      form.email.value,
      form.firstName.value,
      form.lastName.value
    );
  };

  async getAvailableUsername(username) {
    const client = new ApiClient(API_HOST);
    return await client.getAvailableUsername(username);
  }

  async checkUserExists(username) {
    const client = new ApiClient(API_HOST);
    return await client.checkUserExists(username);
  }

  async checkEmailTaken(email) {
    const client = new ApiClient(API_HOST);
    return await client.checkEmailTaken(email);
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
      this.unavailable = false;
      this.error = '';
    } catch (e) {
      this.error = e.message;
    }
  };

  usernameInputHandler = async (event) => {
    const result = event.target.value.replace(/\s|\W/g, '');

    this.setState({ username: result });
    this.usernameManuallyChanged = true;
    
    try {
      this.unavailable = await this.checkUserExists(result);
      this.error = '';
    } catch (e) {
      this.error = e.message;
    }

    this.unavailable ? this.username.setCustomValidity('Username is taken') : this.username.setCustomValidity('');
  };

  emailValidation = async (event) => {
    const result = event.target.value.trim();

    let unavailable;
    try {
      unavailable = await this.checkEmailTaken(result);
      this.error = '';
    } catch (e) {
      this.error = e.message;
    }
    unavailable ? this.email.setCustomValidity('Email is taken') : this.email.setCustomValidity('');
  }

  passwordValidation = () => {
    const pass = this.password;
    const passRepeat = this.passwordRepeat;

    if (!passRepeat.value || pass.value === passRepeat.value) {
      pass.setCustomValidity('');
      passRepeat.setCustomValidity('');
    } else {
      pass.setCustomValidity("Passwords don't match");
      passRepeat.setCustomValidity("Passwords don't match");
    }
  };

  render() {
    if (this.props.registration_success) {
      ga('send', 'event', 'Reg', 'Done');
      return ( <SuccessContent onShowRegisterForm={this.props.onShowRegisterForm} /> );
    }

    const reset = ((e) => e.target.setCustomValidity(''));

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
            <label className="label label-before_input" htmlFor="registerUsername">Username</label>
            <input ref={(c) => this.username = c} onChange={this.usernameInputHandler} className="input input-gray input-big input-block" type="text" placeholder="Username" id="registerUsername" name="username" required="required" value={this.state.username} />
          </div>
          <div className="layout__row layout__row-double">
            <label className="label label-before_input" htmlFor="registerPassword">Password</label>
            <input ref={(c) => this.password = c} onInput={this.passwordValidation} className="input input-gray input-big input-block" type="password" id="registerPassword" name="password" required="required" />
          </div>
          <div className="layout__row layout__row-double">
            <label className="label label-before_input" htmlFor="registerPasswordRepeat">Repeat password</label>
            <input ref={(c) => this.passwordRepeat = c} onInput={this.passwordValidation} className="input input-gray input-big input-block" type="password" id="registerPasswordRepeat" name="password_repeat" required="required" />
          </div>
          <div className="layout__row layout__row-double">
            <label className="label label-before_input label-space" htmlFor="registerEmail">Email</label>
            <input ref={(c) => this.email = c} onChange={this.emailValidation} className="input input-gray input-big input-block" type="email" placeholder="email.address@example.com" id="registerEmail" name="email" required="required" />
          </div>
        </div>
        <div className="layout__row layout__row-double">
          <div className="layout__grid layout__grid-big layout-align_vertical">
            <button className="button button-big button-green">Sign up</button>
            <label className="action checkbox">
              <input name="agree" required="required" type="checkbox" />
              <span className="checkbox__label-right">I agree to Terms &amp; Conditions</span>
            </label>
          </div>
        </div>
      </form>
    </div>
    )
  }
}
