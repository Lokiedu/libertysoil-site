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


export default function UserDetails({ current_user, following, triggers, user }) {
  if (!user) {
    return null;
  }

  const firstName = user.getIn(['more', 'firstName']) || '';
  const lastName = user.getIn(['more', 'lastName']) || '';
  const fullName = `${firstName} ${lastName}`;

  if (user) {
    return (
      <div className="tools_page__details_col">
        <div className="tools_details">
          <div className="tools_details__left_col">
            <Avatar isRound={false} size={140} user={user} />
          </div>
          <div>
            <Link className="tools_details__title" to={`/user/${user.get('username')}`}>
              {user.get('username')}
            </Link>
            <div className="tools_details__description">
              {fullName}
            </div>
            <FollowButton
              active_user={current_user}
              following={following}
              triggers={triggers}
              user={user}
            />
          </div>
        </div>
      </div>
    );
  }

  return null;
}

UserDetails.propTypes = {
  current_user: ImmutablePropType(FollowButton.propTypes.active_user),
  following: ImmutablePropType(FollowButton.propTypes.following),
  triggers: FollowButton.propTypes.triggers,
  user: ImmutablePropType(FollowButton.propTypes.user)
};
