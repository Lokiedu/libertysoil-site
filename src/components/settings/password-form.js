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
import { form as inform, from } from 'react-inform';

import Message from '../message';

class PasswordForm extends React.Component {
  static displayName = 'PasswordForm';

  static propTypes = {
    fields: PropTypes.shape({
      oldPassword: PropTypes.shape({
        error: PropTypes.string
      }).isRequired,
      newPassword: PropTypes.shape({
        error: PropTypes.string
      }).isRequired,
      newPasswordRepeat: PropTypes.shape({
        error: PropTypes.string
      }).isRequired
    }).isRequired,
    form: PropTypes.shape({
      forceValidate: PropTypes.func.isRequired,
      isValid: PropTypes.func.isRequired,
      onValues: PropTypes.func.isRequired
    }).isRequired
  };

  render() {
    const { fields, form } = this.props;

    return (
      <form action="" className="paper__page" autoComplete={false}>
        <h2 className="content__sub_title layout__row">Password</h2>

        <input name="autofillWorkaround" style={{ display: 'none' }} type="password" />

        <div className="layout__row">
          <label className="layout__row layout__row-small" htmlFor="oldPassword">Current password</label>
          <input
            className="input input-block layout__row layout__row-small"
            id="oldPassword"
            name="oldPassword"
            placeholder="secret"
            required
            type="password"
            onChange={this._validateOldPassword}
            {...fields.oldPassword}
          />
          {fields.oldPassword.error &&
            <Message message={fields.oldPassword.error} />
          }
        </div>

        <div className="layout__row">
          <label className="layout__row layout__row-small" htmlFor="newPassword">New password</label>
          <input
            className="input input-block layout__row layout__row-small"
            id="newPassword"
            name="newPassword"
            placeholder="mystery"
            required
            type="password"
            onChange={this._validateNewPassword}
            {...fields.newPassword}
          />
          {fields.newPassword.error &&
            <Message message={fields.newPassword.error} />
          }
        </div>

        <div className="layout__row">
          <label className="layout__row layout__row-small" htmlFor="newPasswordRepeat">Repeat new password</label>
          <input
            className="input input-block layout__row layout__row-small"
            id="newPasswordRepeat"
            name="newPasswordRepeat"
            placeholder="mystery"
            required
            type="password"
            onChange={this._validateNewPasswordRepeat}
            {...fields.newPasswordRepeat}
          />
          {fields.newPasswordRepeat.error &&
            <Message message={fields.newPasswordRepeat.error} />
          }
        </div>
      </form>
    );
  }
}

const validateNewPassword = (password) => {
  if (password && password.length < 8) {
    return false;
  }
  return true;
};

const validateNewPasswordRepeat = (newPasswordRepeat, form) => {
  if (form.newPassword !== newPasswordRepeat) {
    return false;
  }
  return true;
};

const WrappedPasswordForm = inform(from({
  oldPassword: {
    'Enter your current password': o => o
  },
  newPassword: {
    'Enter new password': n => n,
    'Password must contain at least 8 symbols': validateNewPassword
  },
  newPasswordRepeat: {
    'Passwords don\'t match': validateNewPasswordRepeat
  }
}))(PasswordForm);

export default WrappedPasswordForm;
