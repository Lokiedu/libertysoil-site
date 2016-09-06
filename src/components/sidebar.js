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

import { CurrentUser as CurrentUserPropType } from '../prop-types/users';

import TagsInform from './tags-inform';
import Bookmarks from './bookmarks';
import SidebarMenu from './sidebar-menu';

export default class Sidebar extends React.Component {
  static propTypes = {
    current_user: CurrentUserPropType,
    theme: PropTypes.string
  };

  getClassName = () => {
    const { theme } = this.props;
    const finalize = s => `sidebar col col-${s} col-s-${s} col-m-${s} col-l-${s} col-xl-${s}`;

    switch (theme) {
      case 'trunc': return finalize(1);
      case 'min': return finalize(2);
      case 'ext': return finalize(6);
      default: return finalize(4);
    }
  };

  render() {
    const { theme } = this.props;
    let currentUser = this.props.current_user;
    if (!currentUser) {
      currentUser = {};
    }

    const { user = {} } = currentUser;

    return (
      <div className={this.getClassName()}>
        <SidebarMenu current_user={currentUser} theme={theme} />
        <TagsInform current_user={currentUser} theme={theme} />
        {user && user.bookmarks &&
          <Bookmarks bookmarks={user.bookmarks} />
        }
      </div>
    );
  }
}
