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

export default class LoginComponent extends React.Component {
  submitHandler = (event) => {
    event.preventDefault();

    let form = event.target;

    this.props.onLoginUser(form.username.value, form.password.value);
  };

  render() {
    return (
      <div className="box box-middle">
        <header className="box__title">Login?</header>
        <form onSubmit={this.submitHandler} action="" method="post">
          <div className="box__body">
            <div className="layout__row">
              <div className="form__row">
                <label className="label label-block label-space" htmlFor="loginUsername">Username</label>
                <input className="input input-block" id="loginUsername" required="required" type="text" name="username"/>
              </div>
              <div className="form__row">
                <label className="label label-block label-space" htmlFor="loginPassword">Password</label>
                <input className="input input-block" id="loginPassword" required="required" type="password" name="password"/>
              </div>
            </div>
            <div className="layout__row layout layout-align_vertical layout-align_justify">
              {false && <a href="#" className="link">Password reminder</a>}
              <button type="submit" className="button button-wide button-green">Login</button>
            </div>
          </div>
        </form>
      </div>
    )
  }
}

