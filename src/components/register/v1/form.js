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
import { Map as ImmutableMap } from 'immutable';
import { form as inform, from } from 'react-inform';
import { omit, transform } from 'lodash';

import MESSAGE_TYPES from '../../../consts/messageTypeConstants';
import { removeWhitespace as normalizeWhitespace } from '../../../utils/lang';

import Message from '../../message';
import * as Utils from '../utils';
import FormField from './form-field';

const hiddenStyle = { display: 'none' };

const staticFields = {
  registerFirstName: {
    label: 'First name',
    placeholder: 'Firstname'
  },
  registerLastName: {
    label: 'Last name',
    placeholder: 'Lastname'
  },
  registerUsername: {
    label: 'Username',
    placeholder: 'username',
    refName: 'username'
  },
  registerPassword: {
    label: 'Password',
    placeholder: '********',
    type: 'password'
  },
  registerPasswordRepeat: {
    label: 'Repeat password',
    placeholder: '********',
    type: 'password'
  },
  registerEmail: {
    label: 'Email',
    placeholder: 'email.address@example.com',
    type: 'email'
  }
};

const KNOWN_PREDEF_PROPS = ['label', 'refName'];

const FormFieldType = PropTypes.shape({
  error: PropTypes.string
});

class WrappedRegisterFormV1 extends React.Component {
  static propTypes = {
    fields: PropTypes.shape({
      registerFirstName: FormFieldType.isRequired,
      registerLastName: FormFieldType.isRequired,
      registerUsername: FormFieldType.isRequired,
      registerPassword: FormFieldType.isRequired,
      registerPasswordRepeat: FormFieldType.isRequired,
      registerEmail: FormFieldType.isRequired,
      registerAgree: FormFieldType.isRequired
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

    this.fullName = '';
    this.usernameFocused = false;
    this.usernameManuallyChanged = false;
    this.listenersRemoved = false;
    this.touched = {};
    this.state = {
      warn: ImmutableMap()
    };
  }

  componentWillMount() {
    this.props.form.onValues({ agree: false, password: '' });
  }

  componentDidMount() {
    this.username.addEventListener('focus', this.handleUsernameFocus);
    this.username.addEventListener('blur', this.handleUsernameBlur);
    this.username.addEventListener('input', this.handleUsernameInput);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.isVisible && !this.props.isVisible) {
      return this.removeListeners();
    }

    if (this.usernameManuallyChanged) {
      return undefined;
    }

    const { fields: {
      registerFirstName: { value: firstName },
      registerLastName: { value: lastName }
    } } = this.props;

    const { fields: {
      registerFirstName: { value: nextFirstName },
      registerLastName: { value: nextLastName }
    } } = nextProps;

    if (nextFirstName !== firstName || nextLastName !== lastName) {
      this.handleNameChange(nextFirstName, nextLastName);
    }

    return undefined;
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

  handleChange = (event) => {
    const { name, value } = event.target;

    if (!this.touched[name]) {
      this.props.form.touch([name]);
      this.touched[name] = true;
    }

    if (name === 'password') {
      if (value) {
        if (Utils.isPasswordWeak(value)) {
          this.setState(state => ({
            warn: state.warn.set('registerPassword', 'Password is weak. Consider adding more words or symbols')
          }));
          return;
        }
      }

      this.setState(state => ({
        warn: state.warn.set('registerPassword', undefined)
      }));
    }
  }

  handleNameChange = async (firstName, lastName) => {
    const fullName =
      firstName.replace(/[^0-9a-zA-Z-_'\.]/g, '')
      .concat(lastName.replace(/[^0-9a-zA-Z-_'\.]/g, ''));
    if (fullName === this.fullName) {
      return;
    }

    this.fullName = fullName;

    try {
      const username = await Utils.getAvailableUsername(fullName);
      this.changeUsername(username);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e.message);
    }
  };

  handleUsernameInput = (event) => {
    if (this.usernameFocused) {
      this.usernameManuallyChanged = true;
    }

    const field = event.target;
    const raw = field.value;
    this.changeUsername(raw);
  };

  changeUsername = (registerUsername) => {
    const { form } = this.props;
    const prevValues = form.values();
    const nextValues = { ...prevValues, registerUsername };
    form.onValues(nextValues);
  };

  handleUsernameFocus = () => {
    this.usernameFocused = true;
  };

  handleUsernameBlur = () => {
    this.usernameFocused = false;
  };

  handleSubmit = async (e) => {
    e.preventDefault();

    const { form } = this.props;

    form.forceValidate();
    form.touch(Object.keys(FORM_RULES_MAP));

    if (!form.isValid()) {
      return;
    }

    const values = form.values();

    await this.props.onSubmit(
      values.registerUsername,
      values.registerPassword,
      values.registerEmail,
      normalizeWhitespace(values.registerFirstName),
      normalizeWhitespace(values.registerLastName)
    );

    Utils.resetValidatorsCache();
  };

  render() {
    if (!this.props.isVisible) {
      return false;
    }

    const { fields, form } = this.props;

    return (
      <form
        action=""
        autoComplete="off"
        className="layout__row"
        id="registerForm"
        onChange={this.handleChange}
        onSubmit={this.handleSubmit}
      >
        <input name="autofillWorkaround" style={hiddenStyle} type="password" />
        <div className="layout__row">
          {transform(
            fields,
            (acc, fieldValue, fieldName) => {
              const predefProps = staticFields[fieldName];
              if (!predefProps) {
                return acc;
              }

              let refFn;
              if (predefProps.refName) {
                refFn = c => { this[predefProps.refName] = c; };
              }

              acc.push(
                <FormField
                  autoComplete={'new-'.concat(fieldName)}
                  key={fieldName}
                  name={fieldName}
                  refFn={refFn}
                  title={predefProps.label}
                  warn={this.state.warn.get(fieldName)}
                  {...fieldValue}
                  {...omit(predefProps, KNOWN_PREDEF_PROPS)}
                />
              );

              return acc;
            },
            []
          )}
        </div>
        <div className="layout__row layout__row-double">
          {fields.registerAgree.error &&
            <Message message={fields.registerAgree.error} type={MESSAGE_TYPES.ERROR} />
          }
          {/* TODO: Get rid of layout__grid. This is a temporary solution. */}
          <div className="layout__grid layout__grid-big layout__grid-responsive layout__grid-row_reverse layout-align_vertical layout-align_right">
            <label className="action checkbox">
              <input
                id="registerAgree"
                name="registerAgree"
                type="checkbox"
                {...omit(fields.registerAgree, ['error'])}
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

const FORM_RULES_MAP = {
  registerFirstName: {
    'First name must not contain digits': Utils.checkNoDigits
  },
  registerLastName: {
    'Last name must not contain digits': Utils.checkNoDigits
  },
  registerUsername: {
    'You must enter username to continue': Utils.checkTrimmed,
    "Username must contain only letters a-z, digits 0-9, dashes (-), underscores (_), apostrophes (') and periods (.)": Utils.checkUsernameValid,
    'Username is taken': Utils.checkUsernameNotTaken
  },
  registerEmail: {
    'You must enter email to continue': Utils.checkTrimmed,
    'Email is invalid': Utils.checkEmailValid,
    'Email is taken': Utils.checkEmailNotTaken
  },
  registerPassword: {
    'You must enter password to continue': Utils.checkTrimmed,
    'Password must contain at least 8 symbols': Utils.validatePasswordLength
  },
  registerPasswordRepeat: {
    'You must enter your password again to continue': Utils.checkTrimmed,
    "Passwords don't match": Utils.validatePasswordRepeat
  },
  registerAgree: {
    'You have to agree to Terms before registering': a => a
  }
};

const RegisterFormV1 = inform(from(FORM_RULES_MAP))(WrappedRegisterFormV1);

export default RegisterFormV1;
