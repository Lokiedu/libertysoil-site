/*
 This file is a part of libertysoil.org website
 Copyright (C) 2017  Loki Education (Social Enterprise)

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
import classNames from 'classnames';
import { form as inform, from } from 'react-inform';
import { Link } from 'react-router';
import { noop, omit, reduce } from 'lodash';
import { Map as ImmutableMap } from 'immutable';

import { removeWhitespace as normalizeWhitespace } from '../../../utils/lang';

import AltButton from '../../alt-button';
import Button from '../../button';
import FormField from '../../form/field';
import * as Utils from '../utils';
import SignupSuccessMessage from './success';

const hiddenStyle = { display: 'none' };

const staticFields = {
  firstName: {
    label: 'signup.labels.firstname',
    type: 'text'
  },
  lastName: {
    label: 'signup.labels.lastname',
    type: 'text'
  },
  username: {
    label: 'signup.labels.username',
    type: 'text',
    refName: 'username'
  },
  password: {
    label: 'login.labels.password',
    type: 'password'
  },
  passwordRepeat: {
    label: 'signup.labels.password_repeat',
    type: 'password'
  },
  email: {
    label: 'signup.labels.email',
    type: 'text'
  },
  agree: {
    label: 'signup.labels.agree',
    type: 'checkbox'
  }
};

const KNOWN_PREDEF_PROPS = ['label', 'refName'];

const FORM_ERROR_MESSAGE_MAPPING = {
  'req': 'signup.errors.req',
  'name_invalid': 'signup.errors.name_invalid',
  'username_req': 'login.errors.username_req',
  'username_invalid': 'signup.errors.username_invalid',
  'username_taken': 'signup.errors.username_taken',
  'password_req': 'login.errors.password_req',
  'password_repeat_req': 'signup.errors.password_repeat_req',
  'password_match': 'signup.errors.password_match',
  'password_min': 'signup.errors.password_min',
  'email_taken': 'signup.errors.email_taken',
  'email_invalid': 'signup.errors.email_invalid',
  'agree_req': 'signup.errors.agree_req'
};

const pushLogin = location => ({
  ...location,
  query: { ...location.query, route: 'login' }
});

export class SignupFormV2 extends React.Component {
  static displayName = 'SignupFormV2';

  static propTypes = {
    fields: PropTypes.shape({
      username: PropTypes.shape({
        error: PropTypes.string
      }).isRequired,
      password: PropTypes.shape({
        error: PropTypes.string
      }).isRequired
    }).isRequired,
    form: PropTypes.shape({
      forceValidate: PropTypes.func.isRequired,
      isValid: PropTypes.func.isRequired,
      onValues: PropTypes.func.isRequired
    }).isRequired,
    rtl: PropTypes.bool
  };

  static defaultProps = {
    onErrors: noop,
    onSubmit: noop
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
    if (nextProps.registration_success && !this.props.registration_success) {
      return this.removeListeners();
    }

    if (this.usernameManuallyChanged) {
      return undefined;
    }

    const { fields: {
      firstName: { value: firstName },
      lastName: { value: lastName }
    } } = this.props;

    const { fields: {
      firstName: { value: nextFirstName },
      lastName: { value: nextLastName }
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
            warn: state.warn.set('password', 'signup.warns.password_weak')
          }));
          return;
        }
      }

      this.setState(state => ({
        warn: state.warn.set('password', undefined)
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

  changeUsername = (username) => {
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
      true,
      values.username,
      values.password,
      values.email,
      normalizeWhitespace(values.firstName),
      normalizeWhitespace(values.lastName)
    );

    Utils.resetValidatorsCache();
  };

  render() {
    const { fields, translate: t, format: f, rtl } = this.props;

    if (this.props.succeed) {
      return (
        <SignupSuccessMessage
          dispatch={this.props.dispatch}
          rtl={rtl}
          translate={t}
        />
      );
    }

    return (
      <form
        action=""
        autoComplete="off"
        className={classNames('form sidebar-form', { 'form--rtl': rtl })}
        method="post"
        onChange={this.handleChange}
        onSubmit={this.handleSubmit}
      >
        <input name="autofillWorkaround" style={hiddenStyle} type="password" />
        {reduce(
          fields,
          (acc, fieldValue, fieldName) => {
            const error = FORM_ERROR_MESSAGE_MAPPING[fieldValue.error];
            const predefProps = staticFields[fieldName];

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
                title={t(predefProps.label)}
                warn={t(this.state.warn.get(fieldName))}
                {...fieldValue}
                {...omit(predefProps, KNOWN_PREDEF_PROPS)}
                error={error && t(error)}
              />
            );

            return acc;
          },
          []
        )}

        <div className="form__actions-container form__background--bright">
          <div className="form__actions form__actions--align_r">
            <Button
              className="sidebar-modal__button form__submit"
              title={t('signup.action')}
              type="submit"
              onClick={this.handleSubmit}
            />
          </div>
        </div>
        <div className="form__background--bright form__alt">
          <AltButton
            icon="github"
            onClick={undefined}
          >
            {f('signup.with', 'Github')}
          </AltButton>
          <AltButton
            className="margin--all_top"
            icon="facebook-official"
            onClick={undefined}
          >
            {f('signup.with', 'Facebook')}
          </AltButton>
          <Link
            className={AltButton.defaultClassName.concat(" margin--all_top")}
            to={pushLogin}
          >
            {t('signup.login')}
          </Link>
        </div>
      </form>
    );
  }
}

const FORM_RULES_MAP = {
  firstName: {
    'name_invalid': Utils.checkNoDigits
  },
  lastName: {
    'name_invalid': Utils.checkNoDigits
  },
  username: {
    'req': Utils.checkTrimmed,
    'username_invalid': Utils.checkUsernameValid,
    'username_taken': Utils.checkUsernameNotTaken
  },
  email: {
    'req': Utils.checkTrimmed,
    'email_invalid': Utils.checkEmailValid,
    'email_taken': Utils.checkEmailNotTaken
  },
  password: {
    'req': Utils.checkTrimmed,
    'password_min': Utils.validatePasswordLength
  },
  passwordRepeat: {
    'password_repeat_req': Utils.checkTrimmed,
    'password_match': Utils.validatePasswordRepeat
  },
  agree: {
    'agree_req': a => a
  }
};

const LoginForm = inform(from(FORM_RULES_MAP))(SignupFormV2);

export default LoginForm;
