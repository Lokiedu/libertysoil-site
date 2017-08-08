/*
 This file is a part of libertysoil.org website
 Copyright (C) 2017  Loki Education (Social Enterprise)

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
import Link from 'react-router/lib/Link';

import {
  ArrayOfUsers as ArrayOfUsersPropType,
  ArrayOfUsersId as ArrayOfUsersIdPropType,
  CurrentUser as CurrentUserPropType
} from '../prop-types/users';

import { URL_NAMES, getUrl } from '../utils/urlGenerator';
import { parseSocial } from '../utils/user';
import FollowButton from './follow-button';
import IgnoreButton from './ignore-button';
import SocialToolbar from './social-toolbar';

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

    let className = 'card layout__row suggested-user';
    if (this.state.loading) {
      className += ' suggested_users-loading';
    }

    return (
      <div>
        {users.take(3).map(user => {
          const more = user.get('more');
          const avatar = more.get('avatar');
          const username = user.get('username');
          const url = getUrl(URL_NAMES.USER, { username });

          let name;
          if (!more.get('firstName') && !more.get('lastName')) {
            name = '@'.concat(username);
          } else {
            name = user.get('fullName');
          }

          return (
            <div className={className} key={username}>
              <div className="layout__row layout__row-small">
                {avatar &&
                  <Link to={url}>
                    <img alt={name} className="suggested-user__pic" src={avatar.get('url')} />
                  </Link>
                }
                <div className="suggested-user__body">
                  <h4 className="suggested-user__heading">
                    <Link to={url}>{name}</Link>
                  </h4>
                  <p className="suggested-user__about">
                    {more.get('summary')}
                  </p>
                  <SocialToolbar
                    defaultClassName="suggested-user__social"
                    entries={parseSocial(more.get('social'))}
                  />
                  <div className="layout layout__row layout-align_justify layout__row-small">
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
              </div>
            </div>
          );
        })}
      </div>
    );
  }
}
