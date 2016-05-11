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
import { Link }  from 'react-router';
import ga from 'react-google-analytics';


export default class LoginComponent extends React.Component {
  submitHandler = (event) => {
    event.preventDefault();

    const form = event.target;

    this.props.onLoginUser(form.username.value, form.password.value).then(() => {
      ga('send', 'event', 'Login', 'Done');
    });
  };

  render() {
    return (
      <form onSubmit={this.submitHandler} action="" method="post" className="layout__grid layout__grid-responsive layout-align_end layout__space-double">
          <div className="layout__grid_item layout__grid_item-identical">
            <label className="label label-before_input" htmlFor="loginUsername">User name</label>
            <div className="input_group">
              <span className="input_group__before input_group__before-outside micon micon-extra">person</span>
              <div className="input_group__input">
                <input
                  className="input input-big input-block"
                  id="loginUsername"
                  required="required"
                  type="text"
                  name="username"
                  placeholder="Username"
                  autoCapitalize="none"
                  autoCorrect="off"
                />
              </div>
            </div>
          </div>
          <div className="layout__grid_item layout__grid_item-identical">
            <label className="label label-before_input" htmlFor="loginPassword">Password</label>
            <div className="input_group">
              <div className="input_group__input">
                <input className="input input-big input-block" id="loginPassword" required="required" type="password" name="password" placeholder="Password" />
              </div>
              <Link to="/resetpassword" className="link input_group__after input_group__after-outside_bottom">Forgot your password?</Link>
            </div>
          </div>
          <div className="layout__grid_item">
            <button className="button button-big button-red">Log in</button>
          </div>
      </form>
    );
  }
}
