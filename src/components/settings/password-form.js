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

// TODO: Consider using redux-form or formsy-react or  another form library.
export default class PasswordForm extends React.Component {
  static displayName = 'PasswordForm';

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
        old_password: null,
        new_password: null,
        new_password_repeat: null
      }
    };
  }

  _validateOldPassword = () => {
    const errors = this.state.errors;
    const { old_password } = this.form;

    if (old_password.value.length === 0) {
      errors.old_password = 'Enter your current password';
    } else {
      errors.old_password = null;
    }

    this.setState({ errors });
  };

  _validateNewPassword = () => {
    const errors = this.state.errors;
    const { new_password } = this.form;

    if (new_password.value.length < 8) {
      errors.new_password = 'Password must be at least 8 characters';
    } else {
      errors.new_password = null;
    }

    this.setState({ errors });
  };

  _validateNewPasswordRepeat = () => {
    const errors = this.state.errors;
    const { new_password, new_password_repeat } = this.form;

    if (new_password_repeat.value.length > 0 && new_password.value !== new_password_repeat.value) {
      errors.new_password_repeat = 'Passwords do not match';
    } else {
      errors.new_password_repeat = null;
    }

    this.setState({ errors });
  };

  _handleSubmit = (event) => {
    const { old_password, new_password, new_password_repeat } = this.state.errors;
    const valid = !old_password && !new_password && !new_password_repeat;

    if (valid) {
      this.props.onSubmit(event);
    } else {
      event.preventDefault();
    }
  };

  render() {
    const { errors } = this.state;

    return (
      <form action="" className="paper__page" ref={c => this.form = c} onSubmit={this._handleSubmit}>
        <h2 className="content__sub_title layout__row">Password</h2>

        <label className="layout__row layout__row-small" htmlFor="old_password">Current password</label>
        <input
          className="input input-block layout__row layout__row-small"
          id="old_password"
          name="old_password"
          placeholder="secret"
          required
          type="password"
          onChange={this._validateOldPassword}
        />
        {errors.old_password && <div className="validation_error">{errors.old_password}</div>}

        <label className="layout__row layout__row-small" htmlFor="new_password">New password</label>
        <input
          className="input input-block layout__row layout__row-small"
          id="new_password"
          name="new_password"
          placeholder="mystery"
          required
          type="password"
          onChange={this._validateNewPassword}
        />
        {errors.new_password && <div className="validation_error">{errors.new_password}</div>}

        <label className="layout__row layout__row-small" htmlFor="new_password_repeat">Repeat new password...</label>
        <input
          className="input input-block layout__row layout__row-small"
          id="new_password_repeat"
          name="new_password_repeat"
          placeholder="mystery"
          required
          type="password"
          onChange={this._validateNewPasswordRepeat}
        />
        {errors.new_password_repeat && <div className="validation_error">{errors.new_password_repeat}</div>}

        <input className="hidden" ref={c => this.submit = c} type="submit" />
      </form>
    );
  }
}
