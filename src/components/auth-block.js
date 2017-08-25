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
import { Link } from 'react-router';
import throttle from 'lodash/throttle';

import { CurrentUser as CurrentUserPropType } from '../prop-types/users';
import { API_HOST } from '../config';
import { URL_NAMES, getUrl } from '../utils/urlGenerator';
import { IntercomAPI } from './intercom';

import Avatar from './user/avatar';
import { v2 as Dropdown } from './dropdown';
import MenuItem from './menu-item';

function handleLogout() {
  IntercomAPI('shutdown');
}

const menuItems = username => ([
  { key: 'profile',
    node: <Link to={getUrl(URL_NAMES.USER, { username })}>My profile</Link> },
  { key: 'settings',
    node: <Link to={getUrl(URL_NAMES.SETTINGS)}>Profile settings</Link> },
  { key: 'logout',
    node: (
      <form action={`${API_HOST}/api/v1/logout`} method="post" onSubmit={handleLogout}>
        <button
          className="button button-transparent button-wide button-caption_left"
          type="submit"
        >Log out</button>
      </form>
    ) }
]);

export default class AuthBlock extends React.Component {
  static displayName = 'AuthBlock';

  static propTypes = {
    current_user: CurrentUserPropType,
    is_logged_in: PropTypes.bool.isRequired
  };

  shouldComponentUpdate(nextProps) {
    return nextProps !== this.props;
  }

  pushLogin = throttle(
    location => ({
      ...location,
      query: { ...location.query, route: 'login' }
    }),
    200
  );

  render() {
    const { current_user, is_logged_in } = this.props;

    if (is_logged_in) {
      return (
        <Dropdown
          className="header__auth header__toolbar"
          icon={
            <div className="header__corner header__toolbar_item">
              <Avatar
                isRound={false}
                size={60}
                user={current_user.get('user')}
              />
            </div>
          }
          theme="new"
        >
          {menuItems(current_user.getIn(['user', 'username'])).map(menuItem =>
            <MenuItem className="menu__item--theme_new" key={menuItem.key}>
              {menuItem.node}
            </MenuItem>
          )}
        </Dropdown>
      );
    }

    return (
      <div className="header__toolbar">
        <div className="header__toolbar_item header__toolbar_item-right_space">
          <Link
            className="header__toolbar_item"
            to={this.pushLogin}
          >
            Login
          </Link>
        </div>
      </div>
    );
  }
}
