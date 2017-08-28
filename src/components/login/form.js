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
import { form as inform, from } from 'react-inform';
import classNames from 'classnames';
import noop from 'lodash/noop';
import reduce from 'lodash/reduce';
import transform from 'lodash/transform';
import { Link } from 'react-router';

import AltButton from '../alt-button';
import Button from '../button';
import FormField from '../form/field';

const hiddenStyle = { display: 'none' };

const staticFields = {
  username: {
    label: 'login.labels.username',
    type: 'text'
  },
  password: {
    label: 'login.labels.password',
    type: 'password'
  }
};

const FORM_ERROR_MESSAGE_MAPPING = {
  'username_req': 'login.errors.username_req',
  'password_req': 'login.errors.password_req'
};

const pushSignup = location => ({
  ...location,
  query: { ...location.query, route: 'signup' }
});

export class LoginFormV2 extends React.Component {
  static displayName = 'LoginFormV2';

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

  handleSubmit = (e) => {
    e.preventDefault();

    const { form } = this.props;
    form.forceValidate();
    if (!form.isValid()) {
      return this.props.onErrors(
        transform(
          this.props.fields,
          (acc, field) => { field.error && acc.push(field.error); },
          []
        )
      );
    }

    const values = form.values();
    return this.props.onSubmit(true, values.username, values.password);
  };

  render() {
    const { fields, translate: t, format: f } = this.props;

    return (
      <form
        action=""
        autoComplete="off"
        className={classNames('form', { 'form--rtl': this.props.rtl })}
        method="post"
        onSubmit={this.handleSubmit}
      >
        <input name="autofillWorkaround" style={hiddenStyle} type="password" />
        {reduce(
          fields,
          (acc, fieldValue, fieldName) => {
            const error = FORM_ERROR_MESSAGE_MAPPING[fieldValue.error];
            const { label, ...predefProps } = staticFields[fieldName];

            acc.push(
              <FormField
                name={fieldName}
                title={t(label)}
                {...fieldValue}
                {...predefProps}
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
              title={t('login.action')}
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
            {f('login.with', 'Github')}
          </AltButton>
          <AltButton
            className="margin--all_top"
            icon="facebook-official"
            onClick={undefined}
          >
            {f('login.with', 'Facebook')}
          </AltButton>
          <Link
            className={AltButton.defaultClassName.concat(' margin--all_top form__alt-item--theme_paper')}
            to={pushSignup}
          >
            {t('login.create_new')}
          </Link>
        </div>
      </form>
    );
  }
}

function checkTrimmed(val = '') {
  return val.trim();
}

const LoginForm = inform(from({
  username: {
    'username_req': checkTrimmed
  },
  password: {
    'password_req': checkTrimmed
  }
}))(LoginFormV2);

export default LoginForm;
