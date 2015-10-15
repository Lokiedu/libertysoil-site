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

import User from './user';
import FollowButton from '../components/follow-button'

export default class ProfileHeader extends React.Component {
  static displayName = 'ProfileHeader'

  render () {
    const { user, current_user, i_am_following } = this.props;
    let name = user.username;

    if (user.more) {
      if (user.more.firstName || user.more.lastName) {
        name = `${user.more.firstName} ${user.more.lastName}`;
      }
    }

    name = name.trim();

    return (
      <div className="profile">
        <div className="profile__body">
          <div className="layout__row">
            <User user={user} avatarSize="120" isRound={true} hideText={true} />
          </div>
          <div className="layout__row">
            <div className="layout__grid">
              <div className="layout__grid_item layout__grid_item-wide">
                <div className="profile__title">{name}</div>
              </div>
              <div className="layout__grid_item">
                <br />
                {/*  Following  */}
              </div>
              <div className="layout__grid_item">
                <br />
                {/*  Followers  */}
              </div>
              <div className="layout__grid_item">
                <FollowButton active_user={current_user} user={user} following={i_am_following} triggers={this.props.triggers} />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
