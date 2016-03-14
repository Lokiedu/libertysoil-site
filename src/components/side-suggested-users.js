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
import React, { PropTypes } from 'react';
import _ from 'lodash';

import FollowButton from './follow-button';
import IgnoreButton from './ignore-button';
import User from './user';


export default class SideSuggestedUsers extends React.Component {
  static displayName = 'SideSuggestedUsers';

  static propTypes = {
    current_user: PropTypes.shape({
      id: PropTypes.string.isRequired
    }),
    i_am_following: PropTypes.arrayOf(PropTypes.string.isRequired),
    triggers:  PropTypes.shape({
      followUser: PropTypes.func.isRequired,
      unfollowUser: PropTypes.func.isRequired,
      ignoreUser: React.PropTypes.func.isRequired
    }),
    users: PropTypes.arrayOf(PropTypes.shape({
      avatar: PropTypes.shape({
        url: PropTypes.string.isRequired
      }),
      id: PropTypes.string.isRequired,
      username: PropTypes.string,
      more: PropTypes.shape({
        firstName: PropTypes.string,
        lastName: PropTypes.string
      })
    }))
  };

  ignoreUser(user) {
    // animation of disappearing goes here

    this.props.trigger.ignoreUser(user);
  }

  render() {
    const {
      current_user,
      i_am_following,
      users,
      triggers
    } = this.props;

    if (!users.length) {
      return null;
    }

    return (
      <div className="side_block">
        <h4 className="side_block__heading">People to follow:</h4>
        { _.take(users, 3).map((user) => (
          <div className="layout__row" key={`user-${user.id}`}>
            <div className="layout__row layout__row-small">
              <User
                avatarSize="32"
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
              <IgnoreButton
                active_user={current_user}
                triggers={ { ignoreUser: this.ignoreUser } }
                user={user}
              />
            </div>
          </div>
        ))}
      </div>
    )
  }
}
