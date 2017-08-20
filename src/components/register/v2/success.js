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

import { showRegisterForm } from '../../../actions/ui';

export default class SignupSuccessMessage extends React.Component {
  static contextTypes = {
    router: PropTypes.shape().isRequired
  };

  static propTypes = {
    dispatch: PropTypes.func,
    translate: PropTypes.func.isRequired
  };

  shouldComponentUpdate(nextProps) {
    return nextProps !== this.props;
  }

  handleClick = () => {
    setTimeout(() => this.props.dispatch(showRegisterForm()), 100);
  };

  render() {
    const { translate: t } = this.props;

    return (
      <div className={classNames('form', { 'form--rtl': this.props.rtl })}>
        <header className="form__subheader form__background--bright">
          {t('signup.success.title')}
        </header>
        <div className="form__row form__background--bright">
          <div className="form__label">
            {t('signup.success.check_email')}<br />
            {t('signup.success.alt')} <span className="link" onClick={this.handleClick}>
              {t('signup.success.display_form')}
            </span>
          </div>
        </div>
      </div>
    );
  }
}
