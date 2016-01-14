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
import React, { Component } from 'react'

class SuccessContent extends Component {

  clickHandler = (event) => {
    event.preventDefault();
    this.props.onShowRegisterForm();
  }

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
  submitHandler = (event) => {
    event.preventDefault();

    let form = event.target;

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

  render() {
    if (this.props.registration_success) {
      return ( <SuccessContent onShowRegisterForm={this.props.onShowRegisterForm} /> );
    }
    return (
    <div className="div">
      <header className="layout__row layout__row-double">
        <p className="layout__row content content-small">Create new account</p>
        <div className="layout__row content__head">Be the change</div>
        <div className="layout__row content content-small">
          <p>Connect with parents and education professionals from around the world to make education better for all children in all schools and families worldwide.</p>
        </div>
      </header>
      <form action="" onSubmit={this.submitHandler} className="layout__row">
        <div className="layout__row">
          <div className="layout__row layout__row-double">
            <label className="label label-before_input" htmlFor="registerUsername">User name</label>
            <input className="input input-gray input-big input-block" type="text" placeholder="Username" id="registerUsername" name="username" required="required" />
          </div>
          <div className="layout__row layout__row-double">
            <label className="label label-before_input" htmlFor="registerPassword">Password</label>
            <input className="input input-gray input-big input-block" type="password" id="registerPassword"name="password" required="required" />
          </div>
          <div className="layout__row layout__row-double">
            <label className="label label-before_input" htmlFor="registerPasswordRepeat">Repeat password</label>
            <input className="input input-gray input-big input-block" type="password" id="registerPasswordRepeat"name="password_repeat" required="required" />
          </div>
          <div className="layout__row layout__row-double">
            <label className="label label-before_input" htmlFor="registerFirstName">First name</label>
            <input className="input input-gray input-big input-block" type="text" placeholder="Firstname" id="registerFirstName" name="firstName" />
          </div>
          <div className="layout__row layout__row-double">
            <label className="label label-before_input" htmlFor="registerLastName">Last name</label>
            <input className="input input-gray input-big input-block" type="text" placeholder="Lastname" id="registerLastName" name="lastName" />
          </div>
          <div className="layout__row layout__row-double">
            <label className="label label-before_input label-space" htmlFor="registerEmail">Email</label>
            <input className="input input-gray input-big input-block" type="email" placeholder="email.address@example.com" id="registerEmail" name="email" required="required" />
          </div>
        </div>
        <div className="layout__row layout__row-double">
          <div className="layout__grid layout__grid-big layout-align_vertical">
            <button className="button button-big button-green">Sign up</button>
            <label className="action layout layout-align_vertical"><input type="checkbox" className="checkbox" name="agree" required="required" /><span>I agree to Terms &amp; Conditions</span></label>
          </div>
        </div>
      </form>
    </div>
    )
  }
}
