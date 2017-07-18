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
import { omit } from 'lodash';
import debounce from 'debounce-promise';
import zxcvbn from 'zxcvbn';

import MESSAGE_TYPES from '../../../consts/messageTypeConstants';
import { API_HOST } from '../../../config';
import ApiClient from '../../../api/client';

import Message from '../../message';
import FormField from './form-field';

const client = new ApiClient(API_HOST);

function debounceCached(f, timeout = 250) {
  // eslint-disable-next-line no-var
  var cache = {};
  return debounce(async function (s) {
    if (cache[s] === undefined) {
      cache[s] = await f(s);
    }
    return cache[s];
  }, timeout);
}

const getAvailableUsername = debounceCached(async (username) =>
  await client.getAvailableUsername(username)
);

class WrappedRegisterFormV1 extends React.Component {
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
    }).isRequired,
    isVisible: PropTypes.bool,
    onSubmit: PropTypes.func.isRequired
  };

  constructor(...args) {
    super(...args);

    this.usernameRefFn = c => this.username = c;
    this.usernameFocused = false;
    this.usernameManuallyChanged = false;
    this.listenersRemoved = false;
    this.state = {
      registerFirstName: '',
      registerLastName: '',
      passwordWarning: ''
    };
  }

  componentDidMount() {
    this.username.addEventListener('focus', this.handleUsernameFocus);
    this.username.addEventListener('blur', this.handleUsernameBlur);
    this.username.addEventListener('input', this.handleUsernameInput);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.registration_success && !this.props.registration_success) {
      this.removeListeners();
    }
  }

  componentWillUnmount() {
    this.removeListeners();
  }

  removeListeners = () => {
    if (!this.listenersRemoved && this.username) {
      this.username.removeEventListener('focus', this.handleUsernameFocus);
      this.username.removeEventListener('blur', this.handleUsernameBlur);
      this.username.removeEventListener('input', this.handleUsernameInput);
      this.listenersRemoved = true;
    }
  };

  handleFormChange = (event) => {
    const t = event.target;
    if (t.name === 'password') {
      if (t.value) {
        if (zxcvbn(t.value).score <= 1) {
          this.setState({
            passwordWarning: 'Password is weak. Consider adding more words or symbols'
          });
          return;
        }
      }

      this.setState({ passwordWarning: '' });
    }
  };

  handleNameChange = async (event) => {
    const field = event.target;
    const attr = field.getAttribute('name');
    if (!Object.keys(this.state).includes(attr)) {
      return;
    }
    const input = field.value.replace(/[\f\n\r\t\v0-9]/g, '');
    this.setState({ [attr]: input });

    if (this.usernameManuallyChanged) {
      return;
    }

    let result = input + this.state.registerLastName;
    if (attr === 'registerLastName') {
      result = this.state.registerFirstName + input;
    }

    result = result.trim();
    if (result) {
      result = await getAvailableUsername(result);
    }
    this.changeUsername(result);
  };

  handleSubmit = (event) => {
    event.preventDefault();
    const { form, fields } = this.props;

    form.forceValidate();
    if (!form.isValid()) {
      return;
    }

    const htmlForm = event.target;
    this.props.onSubmit(
      fields.username.value,
      fields.password.value,
      fields.email.value,
      htmlForm.querySelector('input[name=registerFirstName]').value,
      htmlForm.querySelector('input[name=registerLastName]').value
    );
  };

  handleUsernameInput = (event) => {
    if (this.usernameFocused) {
      this.usernameManuallyChanged = true;
    }

    const field = event.target;
    const raw = field.value;
    this.changeUsername(raw);
  };

  changeUsername = (input) => {
    const username = input.replace(/[^-_\.'A-Za-z0-9]/g, '').substr(0, 30);

    const { form } = this.props;
    const prevValues = form.values();
    const nextValues = { ...prevValues, username };
    form.onValues(nextValues);
  };

  handleUsernameFocus = () => {
    this.usernameFocused = true;
  };

  handleUsernameBlur = () => {
    this.usernameFocused = false;
  };

  render() {
    if (!this.props.isVisible) {
      return false;
    }

    const { fields, form } = this.props;

    return (
      <form action="" className="layout__row" id="registerForm" onChange={this.handleFormChange} onSubmit={this.handleSubmit}>
        <div className="layout__row">
          <FormField
            name="registerFirstName"
            placeholder="Firstname"
            title="First name"
            value={this.state.firstName}
            onChange={this.handleNameChange}
          />
          <FormField
            name="registerLastName"
            placeholder="Lastname"
            title="Last name"
            value={this.state.lastName}
            onChange={this.handleNameChange}
          />
          <FormField
            name="registerUsername"
            placeholder="Username"
            title="Username"
            refFn={this.usernameRefFn}
            {...fields.username}
          />
          <FormField
            name="registerPassword"
            placeholder="********"
            title="Password"
            type="password"
            warn={this.state.passwordWarning}
            {...fields.password}
          />
          <FormField
            name="registerPasswordRepeat"
            placeholder="********"
            title="Repeat password"
            type="password"
            {...fields.passwordRepeat}
          />
          <FormField
            name="registerEmail"
            placeholder="email.address@example.com"
            title="Email"
            type="email"
            {...fields.email}
          />
        </div>
        <div className="layout__row layout__row-double">
          {fields.agree.error &&
            <Message message={fields.agree.error} type={MESSAGE_TYPES.ERROR} />
          }
          {/* TODO: Get rid of layout__grid. This is a temporary solution. */}
          <div className="layout__grid layout__grid-big layout__grid-responsive layout__grid-row_reverse layout-align_vertical layout-align_right">
            <label className="action checkbox">
              <input
                id="registerAgree"
                name="agree"
                required="required"
                type="checkbox"
                {...omit(fields.agree, ['error'])}
              />
              <span className="checkbox__label-right">I agree to Terms &amp; Conditions</span>
            </label>
            <button className="button button-big button-green">Sign up</button>
          </div>
        </div>
      </form>
    );
  }
}

const checkEmailNotTaken = debounceCached(email =>
  client.checkEmailTaken(email).then(taken => !taken)
);

const checkUsernameNotTaken = debounceCached(username =>
  client.checkUserExists(username).then(exists => !exists)
);

const validatePassword = (password) => {
  if (password && password.length < 8) {
    return false;
  }
  return true;
};

const validatePasswordRepeat = (passwordRepeat, form) => {
  if (form.password !== passwordRepeat) {
    return false;
  }
  return true;
};

const RegisterFormV1 = inform(from({
  username: {
    'You must enter username to continue': u => u,
    'Username is taken': checkUsernameNotTaken
  },
  email: {
    'You must enter email to continue': e => e,
    'Email is taken': checkEmailNotTaken
  },
  password: {
    'You must enter password to continue': p => p,
    'Password must contain at least 8 symbols': validatePassword
  },
  passwordRepeat: {
    'You must enter your password again to continue': p => p,
    'Passwords don\'t match': validatePasswordRepeat
  },
  agree: {
    'You have to agree to Terms before registering': a => a
  }
}))(WrappedRegisterFormV1);

export default RegisterFormV1;
