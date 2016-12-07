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
import React from 'react';
import { Link } from 'react-router';

import {
  Immutable as ImmutablePropType
} from '../../prop-types/common';
import Avatar from '../user/avatar';
import FollowButton from '../follow-button';
import UserRoles from './user-roles';


export default function UserDetails({ current_user, following, triggers, user }) {
  if (!user) {
    return null;
  }

  const firstName = user.getIn(['more', 'firstName']) || '';
  const lastName = user.getIn(['more', 'lastName']) || '';
  const fullName = `${firstName} ${lastName}`;
  const isFollowingCurrentUser = following.get(user.get('id')) && following.get(user.get('id')).includes(current_user.get('id'));

  return (
    <div className="tools_page__details_col">
      <div className="tools_details">
        <Link className="tools_details__left_col" to={`/user/${user.get('username')}`}>
          <Avatar isRound={false} size={140} user={user} />
          {isFollowingCurrentUser &&
            <div className="people_tool__following_you">Following you</div>
          }
        </Link>
        <div>
          <div className="tools_details__title">
            <Link to={`/user/${user.get('username')}`}>
              {fullName}
              <div className="tools_details__subtext">
                {user.get('username')}
              </div>
            </Link>
          </div>
          <div className="tools_details__paragraph">
            <UserRoles roles={user.getIn(['more', 'roles'])} />
          </div>
          {user.getIn(['more', 'bio']) &&
            <div className="tools_details__description">
              {user.getIn(['more', 'bio'])}
            </div>
          }
          <FollowButton
            active_user={current_user}
            following={following.get(current_user.get('id'))}
            triggers={triggers}
            user={user}
          />
        </div>
      </div>
    </div>
  );
}

UserDetails.propTypes = {
  current_user: ImmutablePropType(FollowButton.propTypes.active_user),
  following: ImmutablePropType(FollowButton.propTypes.following),
  triggers: FollowButton.propTypes.triggers,
  user: ImmutablePropType(FollowButton.propTypes.user)
};
