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
import ga from 'react-google-analytics';
import classNames from 'classnames';
import t from 't8on';

import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from '../../../consts/localization';

import RegisterForm from './form';
import SuccessContent from './success';

const canUseDOM = !!(
  (typeof window !== 'undefined' &&
  window.document && window.document.createElement)
);

export default class RegisterComponentV1 extends React.PureComponent {
  static displayName = 'RegisterComponentV1';

  static propTypes = {
    onRegisterUser: PropTypes.func.isRequired,
    onShowRegisterForm: PropTypes.func.isRequired,
    registration_success: PropTypes.bool,
    translation: PropTypes.shape()
  };

  static defaultProps = {
    translation: ImmutableMap({
      format: t.translateTo(DEFAULT_LOCALE),
      locale: DEFAULT_LOCALE,
      translate: t.translateTo(DEFAULT_LOCALE)
    })
  };

  render() {
    const { translation: t, registration_success } = this.props;
    const translate = t.get('translate');

    let formOrDummy;

    if (canUseDOM) {
      formOrDummy = (
        <RegisterForm
          isVisible={!registration_success}
          translation={t}
          onShowRegisterForm={this.props.onShowRegisterForm}
          onSubmit={this.props.onRegisterUser}
        />
      );
    } else {
      formOrDummy = (
        <div className="layout__row">
          {translate('signup.page.loading')}
        </div>
      );
    }

    let header;
    if (registration_success) {
      ga('send', 'event', 'Reg', 'Done');
      header = (
        <SuccessContent
          translation={t}
          onShowRegisterForm={this.props.onShowRegisterForm}
        />
      );
    } else {
      header = (
        <header className="layout__row layout__row-double">
          <p className="layout__row content content-small">
            {translate('signup.page.title')}
          </p>
          <div className="layout__row content__head">
            {translate('signup.page.slogan')}
          </div>
          <div className="layout__row content content-small">
            <p>{translate('signup.page.motivation')}</p>
          </div>
        </header>
      );
    }

    const className = classNames(
      'div',
      { 'font--rtl': SUPPORTED_LOCALES[t.get('locale')].rtl }
    );

    return (
      <div className={className} id="register">
        {header}
        {formOrDummy}
      </div>
    );
  }
}
