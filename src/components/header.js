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
import {Link} from 'react-router';

import User from './user';

import {API_HOST} from '../config'

export default class HeaderComponent extends React.Component {

  render() {
    let AuthBlock;
    var classNames = 'header page__header ' + this.props.className;

    if (this.props.is_logged_in) {
      AuthBlock =
          <div className="header__toolbar">
            <div className="header__toolbar_item">
              <User user={this.props.current_user} hideText={true} />
            </div>
            <form className="header__toolbar_item" action={`${API_HOST}/api/v1/logout`} method="post">
              <button type="submit" className="link">Log out</button>
            </form>
          </div>;
    } else {
      AuthBlock =
          <div className="header__toolbar">
            <div className="header__toolbar_item">
              <Link to="/auth" className="header__toolbar_item">Login</Link>
            </div>
          </div>;
    }

    return (
      <div {...this.props} className={classNames}>
        <div className="header__body">
          <div className="header__logo">
            <a href="/" className="logo" title="Liberty Soil"><span className="logo__title">Liberty Soil</span></a>
          </div>
          {AuthBlock}
        </div>
      </div>
    )
  }
}
