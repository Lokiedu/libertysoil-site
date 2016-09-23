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
import { form as inform, from, DisabledFormSubmit } from 'react-inform';
import { omit, reduce } from 'lodash';
import classNames from 'classnames';
import zxcvbn from 'zxcvbn';

import Message from '../message';

const staticFields = {
  oldPassword: {
    label: 'Current password:'
  },
  newPassword: {
    label: 'New password:'
  },
  newPasswordRepeat: {
    label: 'Repeat new password:'
  },
};

const PasswordForm = ({ fields, form, onSubmit }) => (
  <form action="" autoComplete="off" onSubmit={onSubmit}>
    <input name="autofillWorkaround" style={{ display: 'none' }} type="password" />

    {reduce(
      fields,
      (acc, fieldValue, fieldName) => {
        const wrapClassName = classNames('input_wrap', {
          'input_wrap-error': !!fieldValue.error
        });

        acc.push(
          <div key={fieldName}>
            <div className="form__row tools_page__item tools_page__item--close">
              <label className="form__label" htmlFor={fieldName}>
                {staticFields[fieldName].label}
              </label>
              <div className={wrapClassName}>
                <input
                  autoFocus={fieldName === 'oldPassword'}
                  className="input input-block input-narrow input-transparent"
                  id={fieldName}
                  name={fieldName}
                  required
                  type="password"
                  {...omit(fieldValue, ['error'])}
                />
              </div>
            </div>
            {fieldValue.error &&
              <div>
                <Message message={fieldValue.error} />
              </div>
            }
          </div>
        );

        return acc;
      },
      []
    )}

    {form.isValid() &&
      <div className="layout__raw_grid layout__raw_grid--reverse tools_page__item tools_page__item--close tools_page__item--flex">
        <DisabledFormSubmit
          className="button button-wide button-green button--new"
          type="submit"
          value="Save"
        />
      </div>
    }
  </form>
);

PasswordForm.displayName = 'PasswordForm';

PasswordForm.propTypes = {
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
    isValid: PropTypes.func
  }),
  onSubmit: PropTypes.func
};

PasswordForm.defaultProps = {
  onSubmit: () => {}
};

const validateNewPassword = (password) => {
  if (password && password.length < 8) {
    return false;
  }
  return true;
};

const validateNewPasswordChars = (password) => {
  if (!password.match(/[\x20-\x7E]$/)) {
    return false;
  }
  return true;
};

const validateComplexity = (password) => {
  if (zxcvbn(password).score < 3) {
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
    'Password must contain at least 8 symbols': validateNewPassword,
    'Password must contain only ASCII characters': validateNewPasswordChars,
    'Password is too weak. Consider adding more words or symbols': validateComplexity
  },
  newPasswordRepeat: {
    'Passwords don\'t match': validateNewPasswordRepeat
  }
}))(PasswordForm);

export default WrappedPasswordForm;
