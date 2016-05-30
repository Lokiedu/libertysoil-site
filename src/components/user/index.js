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
import { Link } from 'react-router';
import Gravatar from 'react-gravatar';

import { URL_NAMES, getUrl } from '../../utils/urlGenerator';
import { AVATAR_SIZE } from '../../consts/profileConstants';
import UpdatePicture from '../update-picture/update-picture';

const User = (props) => {
  const {
    user,
    avatarPreview,
    hideAvatar,
    editorConfig,
    hideText,
    isRound,
    avatarSize,
    className,
    isLink
  } = props;

  const render = {};
  render.className = `user_box ${className || ''}`;

  const user_url = getUrl(URL_NAMES.USER, { username: user.username });

  if (!hideAvatar) {
    let avatarClassName = 'user_box__avatar';

    if (isRound) {
      avatarClassName += ' user_box__avatar-round';
    }

    let avatar;
    if (avatarPreview) {
      avatar = (
        <img height={parseInt(avatarSize, 10)} src={avatarPreview.url} width={parseInt(avatarSize, 10)} />
      );
    } else if (user.more && user.more.avatar) {
      avatar = (
        <img height={parseInt(avatarSize, 10)} src={user.more.avatar.url} width={parseInt(avatarSize, 10)} />
      );
    } else {
      avatar = (
        <Gravatar default="retro" md5={user.gravatarHash} size={parseInt(avatarSize, 10)} />
      );
    }

    if (isLink) {
      render.avatar = (
        <Link className={avatarClassName} to={user_url}>
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
          <span className="font-bold" key="name">{user.more.firstName} {user.more.lastName}</span>,
          ` (${user.username})`
        ];
      }
    }

    render.changeAvatar = (
      <UpdatePicture
        flexible={editorConfig.flexible}
        limits={{ min: AVATAR_SIZE }}
        preview={AVATAR_SIZE}
        what="profile picture"
        where={modalName}
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

    render.text = (
      <div className="user_box__body">
        <p className="user_box__name">
          {render.name}
        </p>
      </div>
    );
  }

  return (
    <div className={render.className}>
      {render.avatar}
      {render.changeAvatar}
      {render.text}
    </div>
  );
};

User.displayName = 'User';

User.propTypes = {
  avatarSize: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]).isRequired,
  hideAvatar: PropTypes.bool,
  hideText: PropTypes.bool,
  isRound: PropTypes.bool,
  user: PropTypes.shape({
    id: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
    avatar: PropTypes.string
  }).isRequired
};

User.defaultProps = {
  hideAvatar: false,
  hideText: false,
  isRound: true,
  avatarSize: 24,
  isLink: true
};

export default User;
