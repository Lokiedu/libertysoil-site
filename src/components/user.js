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
import React, { Component } from 'react';
import { Link } from 'react-router';
import Gravatar from 'react-gravatar';

import Time from './time';
import { URL_NAMES, getUrl } from '../utils/urlGenerator';
import ChangeAvatar from './settings/change-avatar';

export default class User extends Component {
  static propTypes = {
    user: React.PropTypes.shape({
      id: React.PropTypes.string.isRequired,
      username: React.PropTypes.string.isRequired,
      avatar: React.PropTypes.string
    }).isRequired,
    avatarSize: React.PropTypes.any.isRequired,
    hideAvatar: React.PropTypes.bool,
    isRound: React.PropTypes.bool,
    hideText: React.PropTypes.bool,
    timestamp: React.PropTypes.string,
    timestampLink: React.PropTypes.string
  };

  static defaultProps = {
    hideAvatar: false,
    hideText: false,
    isRound: false,
    avatarSize: 24,
    timestamp: '',
    timestampLink: ''
  };

  render() {
    const {
      user,
      hideAvatar,
      updateAvatarTrigger,
      editable,
      hideText,
      isRound,
      avatarSize,
      timestamp,
      timestampLink,
      className
    } = this.props;

    let render = {};
    render.className = `user_box ${className || ''}`;

    let user_url = getUrl(URL_NAMES.USER, { username: user.username })

    if (!hideAvatar) {
      let avatarClassName = 'user_box__avatar';

      if (isRound) {
        avatarClassName += ' user_box__avatar-round';
      }

      render.avatar = (
        <Link to={user_url} className={avatarClassName}>
          {user.more && user.more.avatar ?
          (<img src={user.more.avatar.url} height={parseInt(avatarSize, 10)} width={parseInt(avatarSize, 10)} />) :
          (<Gravatar md5={user.gravatarHash} size={parseInt(avatarSize, 10)} default="retro" />)
          }
        </Link>
      );
    }

    if (editable) {
      render.changeAvatar = (<ChangeAvatar updateAvatarTrigger={updateAvatarTrigger} current_user={user} />);
    }

    if (!hideText) {
      let name = user.username;

      if (user.more && user.more.firstName && user.more.lastName) {
        name = `${user.more.firstName} ${user.more.lastName}`;
      }

      name = name.trim();

      if (timestamp.size > 0 && timestampLink.length > 0) {
        render.timestamp =
          <p className="user_box__text">
            <Link to={timestampLink}>
              <Time timestamp={timestamp} />
            </Link>
          </p>
      }

      render.text =
        <div className="user_box__body">
          <p className="user_box__name">
            <Link className="link" to={user_url}>{name}</Link>
          </p>
          {render.timestamp}
        </div>;
    }

    return (
      <div className={render.className}>
        {render.avatar}
        {render.changeAvatar}
        {render.text}
      </div>
    )
  }
}
