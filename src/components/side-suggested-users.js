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
  ArrayOfUsers as ArrayOfUsersPropType,
  ArrayOfUsersId as ArrayOfUsersIdPropType,
  CurrentUser as CurrentUserPropType
} from '../prop-types/users';

import FollowButton from './follow-button';
import IgnoreButton from './ignore-button';
import User from './user';

export default class SideSuggestedUsers extends React.Component {
  static displayName = 'SideSuggestedUsers';

  static propTypes = {
    current_user: CurrentUserPropType,
    i_am_following: ArrayOfUsersIdPropType,
    triggers: PropTypes.shape({
      followUser: PropTypes.func.isRequired,
      unfollowUser: PropTypes.func.isRequired,
      ignoreUser: React.PropTypes.func.isRequired
    }),
    users: ArrayOfUsersPropType
  };

  constructor(props) {
    super(props);

    this.state = {
      loading: false
    };
  }

  ignoreUser = async (user) => {
    this.setState({ loading: true });
    await this.props.triggers.ignoreUser(user.get('username'));
    this.setState({ loading: false });
  }

  render() {
    const {
      current_user,
      i_am_following,
      users,
      triggers
    } = this.props;

    if (!users.size) {
      return null;
    }

    let className = 'layout__row suggested_users';
    if (this.state.loading) {
      className += ' suggested_users-loading';
    }

    return (
      <div className="side_block">
        <h4 className="side_block__heading">People to follow:</h4>
        {users.take(3).map((user) => (
          <div className={className} key={`user-${user.get('id')}`}>
            <div className="layout__row layout__row-small">
              <User
                avatar={{ size: 32 }}
                user={user}
              />
            </div>

            <div className="layout__row layout__grid layout__row-small">
              <FollowButton
                active_user={current_user}
                following={i_am_following}
                triggers={triggers}
                user={user}
              />
              <IgnoreButton
                active_user={current_user}
                user={user}
                onClick={this.ignoreUser}
              />
            </div>
          </div>
        )).toJS()}
      </div>
    );
  }
}
