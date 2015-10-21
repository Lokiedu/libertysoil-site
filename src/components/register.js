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
import React from 'react'

export default class RegisterComponent extends React.Component {
  submitHandler = (event) => {
    event.preventDefault();

    let form = event.target;

    if (form.password.value != form.password_repeat.value) {
      form.password_repeat.setCustomValidity("Passwords don't match");
      return;
    } else {
      form.password_repeat.setCustomValidity('');
    }

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

    this.props.history.pushState(null, '/');
  };

  render() {
    return (
    <div className="box box-middle">
      <header className="box__title">Register</header>
      <form action="" onSubmit={this.submitHandler}>
        <div className="box__body">
          <div className="layout__row">
            <div className="form__row">
              <label className="label label-block label-space" htmlFor="registerUsername">Username</label>
              <input className="input input-block" type="text" id="registerUsername" name="username" required="required"/>
            </div>
            <div className="form__row">
              <label className="label label-block label-space" htmlFor="registerFirstName">First name</label>
              <input className="input input-block" type="text" id="registerFirstName" name="firstName"/>
            </div>
            <div className="form__row">
              <label className="label label-block label-space" htmlFor="registerLastName">Last name</label>
              <input className="input input-block" type="text" id="registerLastName"name="lastName"/>
            </div>
            <div className="form__row">
              <label className="label label-block label-space" htmlFor="registerEmail">Email</label>
              <input className="input input-block" type="email" id="registerEmail"name="email" required="required"/>
            </div>
            <div className="form__row">
              <label className="label label-block label-space" htmlFor="registerPassword">Password</label>
              <input className="input input-block" type="password" id="registerPassword"name="password" required="required"/>
            </div>
            <div className="form__row">
              <label className="label label-block label-space" htmlFor="registerPasswordRepeat">Repeat password</label>
              <input className="input input-block" type="password" id="registerPasswordRepeat"name="password_repeat" required="required"/>
            </div>
          </div>
          <div className="layout__row layout layout-align_vertical layout-align_justify">
            <label className="action layout layout-align_vertical"><input type="checkbox" className="checkbox" name="agree" required="required" /><span>I agree to T&amp;C</span></label>
            <button className="button button-wide button-yellow">Create account</button>
          </div>
        </div>
      </form>
    </div>
    )
  }
}
