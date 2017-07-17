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
import React from 'react';

export default class RegisterFormV1Success extends React.Component {
  static propTypes = {
    translation: React.PropTypes.shape({
      translate: React.PropTypes.func.isRequired
    }).isRequired
  };

  clickHandler = (event) => {
    event.preventDefault();
    this.props.onShowRegisterForm();
  };

  render() {
    const translate = this.props.translation.get('translate');

    return (
      <div className="box box-middle">
        <header className="box__title">
          {translate('signup.success.title')}
        </header>
        <div className="box__body">
          <div className="layout__row">
            <div>
              {translate('signup.success.check_email')}&nbsp;
              {translate('signup.success.alt')}&nbsp;
              <a className="link" href="#" onClick={this.clickHandler}>
                {translate('signup.success.display_form')}
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
