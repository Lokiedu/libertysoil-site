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
import React, { Component, PropTypes } from 'react';
import { form as inform, from } from 'react-inform';
import ga from 'react-google-analytics';
import { keys, omit, reduce } from 'lodash';
import debounce from 'debounce-promise';
import zxcvbn from 'zxcvbn';

import MESSAGE_TYPES from '../../../consts/messageTypeConstants';
import { API_HOST } from '../../../config';
import ApiClient from '../../../api/client';
import Message from '../../message';

const canUseDOM = !!(
  (typeof window !== 'undefined' &&
  window.document && window.document.createElement)
);

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
            <div>Please check your email for further instructions. Or <a className="link" href="#" onClick={this.clickHandler}>display register form.</a>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export class UnwrappedRegister extends React.Component {
  static displayName = 'UnwrappedRegister';

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
    onRegisterUser: PropTypes.func.isRequired,
    onShowRegisterForm: PropTypes.func.isRequired,
    registration_success: PropTypes.bool
  };

  constructor(...args) {
    super(...args);

    this.usernameFocused = false;
    this.usernameManuallyChanged = false;
    this.listenersRemoved = false;
    this.state = {
      firstName: '',
      lastName: '',
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

  handleFormChange = event => {
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
  }

  handleSubmit = (event) => {
    event.preventDefault();
    const { form, fields } = this.props;

    form.forceValidate();
    if (!form.isValid()) {
      return;
    }

    const htmlForm = event.target;
    this.props.onRegisterUser(
      fields.username.value,
      fields.password.value,
      fields.email.value,
      htmlForm.querySelector('input[name=firstName]').value,
      htmlForm.querySelector('input[name=lastName]').value
    );
  };

  handleNameChange = async (event) => {
    const field = event.target;
    const attr = field.getAttribute('name');
    if (!keys(this.state).find(v => v === attr)) {
      return;
    }
    const input = field.value.replace(/[\f\n\r\t\v0-9]/g, '');
    this.setState({ [attr]: input });

    if (this.usernameManuallyChanged) {
      return;
    }

    let result = input + this.state.lastName;
    if (attr === 'lastName') {
      result = this.state.firstName + input;
    }

    result = result.trim();
    if (result) {
      result = await getAvailableUsername(result);
    }
    this.changeUsername(result);
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
    const { fields, form } = this.props;

    if (this.props.registration_success) {
      ga('send', 'event', 'Reg', 'Done');
      return <SuccessContent onShowRegisterForm={this.props.onShowRegisterForm} />;
    }

    const htmlFields = reduce(
      fields,
      (acc, value, key) => ({ ...acc, [key]: omit(value, ['error']) }),
      {}
    );

    const formBlock = (
      <form action="" className="layout__row" id="registerForm" onChange={this.handleFormChange} onSubmit={this.handleSubmit}>
        <div className="layout__row">
          <div className="layout__row layout__row-double">
            <label className="label label-before_input" htmlFor="registerFirstName">First name</label>
            <input
              className="input input-gray input-big input-block"
              id="registerFirstName"
              name="firstName"
              placeholder="Firstname"
              type="text"
              value={this.state.firstName}
              onChange={this.handleNameChange}
            />
          </div>
          <div className="layout__row layout__row-double">
            <label className="label label-before_input" htmlFor="registerLastName">Last name</label>
            <input
              className="input input-gray input-big input-block"
              id="registerLastName"
              name="lastName"
              placeholder="Lastname"
              type="text"
              value={this.state.lastName}
              onChange={this.handleNameChange}
            />
          </div>
          <div className="layout__row layout__row-double">
            <label className="label label-before_input" htmlFor="registerUsername">Username</label>
            <input
              className="input input-gray input-big input-block"
              id="registerUsername"
              name="username"
              placeholder="Username"
              ref={c => this.username = c}
              required="required"
              type="text"
              {...htmlFields.username}
            />
            {fields.username.error &&
            <Message message={fields.username.error} type={MESSAGE_TYPES.ERROR} />
            }
          </div>
          <div className="layout__row layout__row-double">
            <label className="label label-before_input" htmlFor="registerPassword">Password</label>
            <input
              className="input input-gray input-big input-block"
              id="registerPassword"
              name="password"
              required="required"
              type="password"
              {...htmlFields.password}
            />
            {fields.password.error &&
            <Message message={fields.password.error} type={MESSAGE_TYPES.ERROR} />
            }
            {this.state.passwordWarning &&
            <Message message={this.state.passwordWarning} />
            }
          </div>
          <div className="layout__row layout__row-double">
            <label className="label label-before_input" htmlFor="registerPasswordRepeat">Repeat password</label>
            <input
              className="input input-gray input-big input-block"
              id="registerPasswordRepeat"
              name="password_repeat"
              required="required"
              type="password"
              {...htmlFields.passwordRepeat}
            />
            {fields.passwordRepeat.error &&
            <Message message={fields.passwordRepeat.error} type={MESSAGE_TYPES.ERROR} />
            }
          </div>
          <div className="layout__row layout__row-double">
            <label className="label label-before_input label-space" htmlFor="registerEmail">Email</label>
            <input
              className="input input-gray input-big input-block"
              id="registerEmail"
              name="email"
              placeholder="email.address@example.com"
              required="required"
              type="email"
              {...htmlFields.email}
            />
            {fields.email.error &&
            <Message message={fields.email.error} type={MESSAGE_TYPES.ERROR} />
            }
          </div>
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
                {...htmlFields.agree}
              />
              <span className="checkbox__label-right">I agree to Terms &amp; Conditions</span>
            </label>
            <button className="button button-big button-green">Sign up</button>
          </div>
        </div>
      </form>
    );

    let formOrDummy;

    if (canUseDOM) {
      formOrDummy = formBlock;
    } else {
      formOrDummy = <div className="layout__row">Form is loading…</div>;
    }

    return (
      <div className="div" id="register">
        <header className="layout__row layout__row-double">
          <p className="layout__row content content-small">Create new account</p>
          <div className="layout__row content__head">Be the change</div>
          <div className="layout__row content content-small">
            <p>Connect with parents and education professionals from around the world to make education better for all children in all schools and families worldwide.</p>
          </div>
        </header>

        {formOrDummy}
      </div>
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

const Register = inform(from({
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
}))(UnwrappedRegister);

export default Register;
