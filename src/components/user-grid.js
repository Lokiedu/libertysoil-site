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
import classNames from 'classnames';

import {
  ArrayOfUsers as ArrayOfUsersPropType,
  ArrayOfUsersId as ArrayOfUsersIdPropType,
  CurrentUser as CurrentUserPropType
} from '../prop-types/users';

import FollowButton from './follow-button';
import User from './user';

const UserGrid = (props) => {
  const {
    current_user,
    i_am_following,
    notFoundMessage,
    triggers,
    users
  } = props;

  if (!users || !users.size) {
    if (notFoundMessage) {
      return <div>{notFoundMessage}</div>;
    }

    return null;
  }

  const usersToShow = users.map((user) => (
    <div className="layout__grids_item layout__grids_item-space layout__grid_item-50" key={`user-${user.get('id')}`}>
      <div className="layout__row layout__row-small">
        <User
          avatar={{ size: 32 }}
          user={user}
        />
      </div>

      <div className="layout__row layout__row-small">
        <FollowButton
          active_user={current_user}
          following={i_am_following}
          triggers={triggers}
          user={user}
        />
      </div>
    </div>
  )).toJS();

  return (
    <div
      className={
        classNames(
          props.className,
          'layout__grids layout__grids-space',
          { 'layout__grid-responsive': props.isResponsive }
        )
      }
    >
      {usersToShow}
    </div>
  );
};

UserGrid.displayName = 'UserGrid';

UserGrid.propTypes = {
  className: PropTypes.string,
  current_user: CurrentUserPropType,
  i_am_following: ArrayOfUsersIdPropType,
  isResponsive: PropTypes.bool,
  notFoundMessage: PropTypes.node,
  triggers: PropTypes.shape({}),
  users: ArrayOfUsersPropType
};

UserGrid.defaultProps = {
  isResponsive: true
};

export default UserGrid;
