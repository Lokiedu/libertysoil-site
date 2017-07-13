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
import ga from 'react-google-analytics';

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
    registration_success: PropTypes.bool
  };

  render() {
    const { registration_success } = this.props;

    let formOrDummy;

    if (canUseDOM) {
      formOrDummy = (
        <RegisterForm
          isVisible={!registration_success}
          onShowRegisterForm={this.props.onShowRegisterForm}
          onSubmit={this.props.onRegisterUser}
        />
      );
    } else {
      formOrDummy = (
        <div className="layout__row">
          Form is loading…
        </div>
      );
    }

    let header;
    if (registration_success) {
      ga('send', 'event', 'Reg', 'Done');
      header = (
        <SuccessContent
          onShowRegisterForm={this.props.onShowRegisterForm}
        />
      );
    } else {
      header = (
        <header className="layout__row layout__row-double">
          <p className="layout__row content content-small">Create new account</p>
          <div className="layout__row content__head">Be the change</div>
          <div className="layout__row content content-small">
            <p>
              Connect with parents and education professionals from around
              the world to make education better for all children in all
              schools and families worldwide.
            </p>
          </div>
        </header>
      );
    }

    return (
      <div className="div" id="register">
        {header}
        {formOrDummy}
      </div>
    );
  }
}
