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
import { defaultSelector } from '../selectors';
import { newPassword } from '../triggers';
import { Link } from 'react-router';

import Footer from '../components/footer';
import Header from '../components/header';
import Messages from '../components/messages';

let SuccessMessage = (props) => {

  return (
    <div>
      You have successfully changed your password. Please proceed into our <Link className="link" to="/auth">login form </Link>.
    </div>
  );

};

let PasswordForm = (props) => {
  return (
    <form onSubmit={props.submitHandler} action="" method="post">
      <div className="layout__row">
        <div className="form__row">
          <label className="label label-block label-space" htmlFor="newPassword">New Password</label>
          <input className="input input-block" id="newPassword" required="required" type="password" name="password"/>
          <label className="label label-block label-space" htmlFor="newPasswordRepeat">Repeat</label>
          <input className="input input-block" id="newPasswordRepeat" required="required" type="password" name="password_repeat"/>
        </div>
      </div>
      <div className="layout__row layout layout-align_vertical layout-align_justify">
        <button type="submit" className="button button-wide button-green">Submit</button>
      </div>
    </form>
  );
};


class Form extends React.Component {

  submitHandler = (event) => {
    event.preventDefault();

    let form = event.target;

    newPassword(this.props.routeParams.hash, form.password.value, form.password_repeat.value);
  };

  render() {

    let {
      messages
    } = this.props;

    let content = <PasswordForm submitHandler={this.submitHandler} />

    if (this.props.ui.submitNewPassword) {
      content = <SuccessMessage />;
    }

    return (
      <div>
        <Header />
          <div className="page__body">
            <div className="area">
              <div>
                <Messages messages={messages}/>
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
