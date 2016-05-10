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
import { AVATAR_SIZE } from '../consts/profileConstants';
import UpdatePicture from './update-picture/update-picture';

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
    isRound: true,
    avatarSize: 24,
    timestamp: '',
    timestampLink: '',
    isLink: true
  };

  render() {
    const {
      user,
      avatarPreview,
      hideAvatar,
      editorConfig,
      hideText,
      isRound,
      avatarSize,
      timestamp,
      timestampLink,
      className,
      isLink
    } = this.props;

    const render = {};
    render.className = `user_box ${className || ''}`;

    const user_url = getUrl(URL_NAMES.USER, { username: user.username })

    if (!hideAvatar) {
      let avatarClassName = 'user_box__avatar';

      if (isRound) {
        avatarClassName += ' user_box__avatar-round';
      }

      let avatar;
      if (avatarPreview) {
        avatar = (
          <img src={avatarPreview.url} height={parseInt(avatarSize, 10)} width={parseInt(avatarSize, 10)} />
        );
      } else if (user.more && user.more.avatar) {
        avatar = (
          <img src={user.more.avatar.url} height={parseInt(avatarSize, 10)} width={parseInt(avatarSize, 10)} />
        );
      } else {
        avatar = (
          <Gravatar md5={user.gravatarHash} size={parseInt(avatarSize, 10)} default="retro" />
        );
      }

      if (isLink) {
        render.avatar = (
          <Link to={user_url} className={avatarClassName}>
            {avatar}
          </Link>
        );
      } else {
        render.avatar = (
          <div className={avatarClassName}>
            {avatar}
          </div>
        );
      }
    }

    if (editorConfig) {
      let modalName = <span className="font-bold">{user.username}</span>;

      if (user.more) {
        if (user.more.firstName || user.more.lastName) {
          modalName = [
            <span className="font-bold">{user.more.firstName} {user.more.lastName}</span>,
            ` (${user.username})`
          ];
        }
      }

      render.changeAvatar = (
        <UpdatePicture
          what="profile picture"
          where={modalName}
          limits={{ min: AVATAR_SIZE }}
          preview={AVATAR_SIZE}
          flexible={editorConfig.flexible}
          onSubmit={editorConfig.onUpdateAvatar}
        />
      );
    }

    if (!hideText) {
      let name = user.username;

      if (user.more && user.more.firstName && user.more.lastName) {
        name = `${user.more.firstName} ${user.more.lastName}`;
      }
      name = name.trim();

      if (isLink) {
        render.name = (<Link className="link" to={user_url}>{name}</Link>);
      } else {
        render.name = name;
      }

      let time;
      if (timestamp.length > 0) {
        time = <Time timestamp={timestamp} />;

        if (isLink && timestampLink.length > 0) {
          time = <Link to={timestampLink}>{time}</Link>;
        }

        render.timestamp = (
          <p className="user_box__text">
            {time}
          </p>
        );
      }

      render.text = (
        <div className="user_box__body">
          <p className="user_box__name">
            {render.name}
          </p>
          {render.timestamp}
        </div>
      );
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
