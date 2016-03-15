/*
 This file is a part of libertysoil.org website
 Copyright (C) 2015  Loki Education (Social Enterprise)

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
import { Link }  from 'react-router';

import { URL_NAMES, getUrl } from '../utils/urlGenerator';

import HeaderLogo from './header-logo';
import User from './user';
import { API_HOST } from '../config'

import Dropdown from './dropdown'

let AuthBlock = (props) => {
  if (props.is_logged_in) {
    const logoutUrl = '/api/v1/logout';

    return (
      <div className="header__toolbar">
        <div className="header__toolbar_item">
          <User user={props.current_user.user} isRound={true} hideText={true} />
          <Dropdown>
            <Link to={getUrl(URL_NAMES.SETTINGS)} className="menu__item">Profile settings</Link>
            <form className="menu__item" action={`${API_HOST}${logoutUrl}`} method="post">
              <button type="submit" className="button button-transparent button-wide button-caption_left">Log out</button>
            </form>
          </Dropdown>
        </div>
      </div>
    );
  }

  return (
    <div className="header__toolbar">
      <div className="header__toolbar_item">
        <Link to="/auth" className="header__toolbar_item">Login</Link>
      </div>
    </div>
  );
};

export default class HeaderComponent extends React.Component {

  render() {
    let {
      children
    } = this.props;

    let classNames = 'header page__header ' + this.props.className;

    return (
      <div {...this.props} className={classNames}>
        <div className="header__body">
          {!React.Children.count(children) &&
            <HeaderLogo small />
          }
          {children}
          <AuthBlock is_logged_in={this.props.is_logged_in} current_user={this.props.current_user}/>
        </div>
      </div>
    )
  }
}
