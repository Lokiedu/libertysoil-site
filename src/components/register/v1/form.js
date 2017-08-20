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
import t from 't8on';

import { DEFAULT_LOCALE } from '../../../consts/localization';
import MESSAGE_TYPES from '../../../consts/messageTypeConstants';
import { removeWhitespace as normalizeWhitespace } from '../../../utils/lang';

import Message from '../../message';
import * as Utils from '../utils';
import FormField from './form-field';

const hiddenStyle = { display: 'none' };

const staticFields = {
  registerFirstName: {
    label: 'signup.labels.firstname',
    placeholder: {
      needTranslate: true,
      value: 'signup.labels.firstname'
    }
  },
  registerLastName: {
    label: 'signup.labels.lastname',
    placeholder: {
      needTranslate: true,
      value: 'signup.labels.lastname'
    }
  },
  registerUsername: {
    label: 'signup.labels.username',
    placeholder: 'username',
    refName: 'username'
  },
  registerPassword: {
    label: 'login.labels.password',
    placeholder: '********',
    type: 'password'
  },
  registerPasswordRepeat: {
    label: 'signup.labels.password_repeat',
    placeholder: '********',
    type: 'password'
  },
  registerEmail: {
    label: 'signup.labels.email',
    placeholder: 'email.address@example.com',
    type: 'email'
  }
};

const KNOWN_PREDEF_PROPS = ['label', 'placeholder', 'refName'];

const FORM_ERROR_MESSAGE_MAPPING = {
  first_name_invalid: 'signup.errors.first_name_invalid',
  last_name_invalid: 'signup.errors.last_name_invalid',
  username_req: 'signup.errors.username_req',
  username_invalid: 'signup.errors.username_invalid.long',
  username_taken: 'signup.errors.username_taken.long',
  password_req: 'signup.errors.password_req',
  password_min: 'signup.errors.password_min.long',
  password_repeat_req: 'signup.errors.password_repeat_req.long',
  password_match: 'signup.errors.password_match.long',
  email_req: 'signup.errors.email_req',
  email_invalid: 'signup.errors.email_invalid.long',
  email_taken: 'signup.errors.email_taken.long',
  agree_req: 'signup.errors.agree_req.long'
};

const FormFieldType = PropTypes.shape({
  error: PropTypes.string
});

export class UnwrappedRegisterFormV1 extends React.Component {
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

  static defaultProps = {
    translation: ImmutableMap({
      format: t.translateTo(DEFAULT_LOCALE),
      locale: DEFAULT_LOCALE,
      translate: t.translateTo(DEFAULT_LOCALE)
    })
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
    this.props.form.onValues({
      registerAgree: false,
      registerPassword: ''
    });
  }

  componentDidMount() {
    if (this.username) {
      this.username.addEventListener('focus', this.handleUsernameFocus);
      this.username.addEventListener('blur', this.handleUsernameBlur);
      this.username.addEventListener('input', this.handleUsernameInput);
    }
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
            warn: state.warn.set('registerPassword', 'signup.warns.password_weak.long')
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
    const t = this.props.translation.get('translate');

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

              const error = FORM_ERROR_MESSAGE_MAPPING[fieldValue.error];
              const label = t(predefProps.label).replace(/:$/, '');
              const warn = this.state.warn.get(fieldName);

              let placeholder;
              const { placeholder: p = '' } = predefProps;
              if (p && typeof p === 'object') {
                if (p.needTranslate) {
                  placeholder = t(p.value);
                } else {
                  placeholder = p.value;
                }
              } else {
                placeholder = p;
              }

              acc.push(
                <FormField
                  autoComplete={'new-'.concat(fieldName)}
                  key={fieldName}
                  name={fieldName}
                  placeholder={placeholder.replace(/:$/, '')}
                  refFn={refFn}
                  title={label}
                  warn={warn && t(warn)}
                  {...fieldValue}
                  {...omit(predefProps, KNOWN_PREDEF_PROPS)}
                  error={error && (t(error) || t(error.replace(/\.long$/, '')))}
                />
              );

              return acc;
            },
            []
          )}
        </div>
        <div className="layout__row layout__row-double">
          {fields.registerAgree.error &&
            <Message
              message={FORM_ERROR_MESSAGE_MAPPING[fields.registerAgree.error]}
              type={MESSAGE_TYPES.ERROR}
            />
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
    first_name_invalid: Utils.checkNoDigits
  },
  registerLastName: {
    last_name_invalid: Utils.checkNoDigits
  },
  registerUsername: {
    username_req: Utils.checkTrimmed,
    username_invalid: Utils.checkUsernameValid,
    username_taken: Utils.checkUsernameNotTaken
  },
  registerPassword: {
    password_req: Utils.checkTrimmed,
    password_min: Utils.validatePasswordLength
  },
  registerPasswordRepeat: {
    password_repeat_req: Utils.checkTrimmed,
    password_match: Utils.validatePasswordRepeat
  },
  registerEmail: {
    email_req: Utils.checkTrimmed,
    email_invalid: Utils.checkEmailValid,
    email_taken: Utils.checkEmailNotTaken
  },
  registerAgree: {
    agree_req: a => a
  }
};

const RegisterFormV1 = inform(from(FORM_RULES_MAP))(UnwrappedRegisterFormV1);

export default RegisterFormV1;
