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
import classNames from 'classnames';
import noop from 'lodash/noop';
import omit from 'lodash/omit';
import reduce from 'lodash/reduce';
import transform from 'lodash/transform';
import { Link } from 'react-router';

import Button from '../button';
import Icon from '../icon';

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

const validIcon = {
  className: 'color-green sidebar-form__check',
  icon: 'check'
};

const invalidIcon = {
  className: 'color-red sidebar-form__check',
  icon: 'minus'
};

function SocialButton({ children, className, icon, ...props }) {
  const cn = classNames(className, SocialButton.defaultClassName);

  let finalIcon;
  if (typeof icon === 'object') {
    finalIcon = {
      ...icon
    };
  } else {
    finalIcon = {
      size: 'small',
      color: 'gray',
      icon
    };
  }

  return (
    <button className={cn} type="button" {...props}>
      <Icon {...finalIcon} />
      {children}
    </button>
  );
}

SocialButton.defaultClassName = [
  'layout',
  'layout-align_vertical',
  'layout-align_center',
  'sidebar-form__input',
  'bio__post--type_text',
  'sidebar-form__social-item'
].join(' ');

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
        className={
          classNames(
            'sidebar-form',
            { 'sidebar-form--rtl': this.props.rtl }
          )
        }
        method="post"
        onSubmit={this.handleSubmit}
      >
        <input name="autofillWorkaround" style={hiddenStyle} type="password" />
        {reduce(
          fields,
          (acc, fieldValue, fieldName) => {
            let statusIcon, dotColor = 'gray';
            if (fieldValue.error) {
              statusIcon = invalidIcon;
              dotColor = 'red';
            } else if (fieldValue.value) {
              statusIcon = validIcon;
            }

            acc.push(
              <div className="sidebar-form__row sidebar-form__background--bright" key={fieldName}>
                <label className="sidebar-form__label" htmlFor={fieldName}>
                  {t(staticFields[fieldName].label)}
                </label>
                <div className="layout layout-align_vertical">
                  <Icon
                    className="sidebar-form__dot"
                    color={dotColor}
                    icon="fiber-manual-record"
                    size="common"
                  />
                  <input
                    className="sidebar-form__input river-item bio__post--type_text input-transparent"
                    id={fieldName}
                    name={fieldName}
                    type={staticFields[fieldName].type}
                    {...omit(fieldValue, ['error'])}
                  />
                  <Icon
                    className="sidebar-form__check"
                    size="common"
                    {...statusIcon}
                  />
                </div>
              </div>
            );

            return acc;
          },
          []
        )}

        <div className="sidebar-form__actions-container sidebar-form__background--bright">
          <div className="sidebar-form__actions">
            <Button
              className="sidebar-modal__button sidebar-form__submit"
              title={t('login.action')}
              type="submit"
              onClick={this.handleSubmit}
            />
          </div>
        </div>
        <div className="sidebar-form__background--bright sidebar-form__social">
          <SocialButton
            icon="github"
            onClick={undefined}
          >
            {f('login.with', 'Github')}
          </SocialButton>
          <SocialButton
            className="margin--all_top"
            icon="facebook-official"
            onClick={undefined}
          >
            {f('login.with', 'Facebook')}
          </SocialButton>
          <Link
            className={SocialButton.defaultClassName.concat(" margin--all_top")}
            to="/auth#register"
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
