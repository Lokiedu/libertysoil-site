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

import {
  ArrayOfUsersId as ArrayOfUsersIdPropType,
  CurrentUser as CurrentUserPropType,
  User as UserPropType
} from '../prop-types/users';

export default class FollowButton extends React.Component {
  static displayName = 'FollowButton';

  static propTypes = {
    active_user: CurrentUserPropType,
    following: ArrayOfUsersIdPropType,
    triggers: PropTypes.shape({
      followUser: PropTypes.func.isRequired,
      unfollowUser: PropTypes.func.isRequired
    }),
    user: UserPropType
  };

  followUser = (event) => {
    event.preventDefault();
    this.props.triggers.followUser(this.props.user);
  }

  unfollowUser = (event) => {
    event.preventDefault();
    this.props.triggers.unfollowUser(this.props.user);
  }

  render() {
    const {
      active_user,
      following,
      user
    } = this.props;

    if (!active_user) {
      return null;  // anonymous
    }

    if (user.id === active_user.id) {
      return null;  // do not allow to follow one's self
    }

    if (following.includes(user.id)) {
      return <button className="button button-wide button-yellow" onClick={this.unfollowUser}>Following</button>;
    }

    return <button className="button button-wide button-green" onClick={this.followUser}>Follow</button>;
  }
}
