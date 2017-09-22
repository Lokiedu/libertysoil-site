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
import PropTypes from 'prop-types';

import React from 'react';
import { Link } from 'react-router';

import { User as UserPropType } from '../../prop-types/users';
import { URL_NAMES, getUrl } from '../../utils/urlGenerator';

import Avatar from './avatar';
import AvatarEditor from './avatar-editor';
import UserText from './user-text';


const User = (props) => {
  const {
    avatar,
    avatarEditor,
    className,
    text,
    isLink,
    user
  } = props;

  const userUrl = getUrl(URL_NAMES.USER, { username: user.get('username') });
  const render = {};

  render.className = 'user_box';
  if (className) {
    render.className += ` ${className}`;
  }

  if (!avatar.hide) {
    let needLink;

    if (!isLink && avatar.isLink) {
      needLink = true;
    }

    render.avatar = <Avatar {...avatar} isLink={needLink} user={user} userUrl={userUrl} />;
  }

  if (avatarEditor) {
    render.avatarEditor = <AvatarEditor user={user} {...avatarEditor} />;
  }

  if (!text.hide) {
    let needLink;

    if (!isLink && text.isLink) {
      needLink = true;
    }

    render.text = <UserText {...text} isLink={needLink} user={user} userUrl={userUrl} />;
  }

  if (isLink) {
    return (
      <Link className={render.className} to={userUrl}>
        {render.avatar}
        {render.avatarEditor}
        {render.text}
      </Link>
    );
  }

  return (
    <div className={render.className}>
      {render.avatar}
      {render.avatarEditor}
      {render.text}
    </div>
  );
};

User.displayName = 'User';

User.propTypes = {
  avatar: PropTypes.shape({}),
  avatarEditor: PropTypes.oneOfType([
    PropTypes.shape({}),
    PropTypes.bool
  ]),
  className: PropTypes.string,
  isLink: PropTypes.bool,
  text: PropTypes.shape({}),
  user: UserPropType.isRequired
  // user: PropTypes.shape({
  //   id: PropTypes.string.isRequired,
  //   username: PropTypes.string.isRequired,
  //   avatar: PropTypes.string
  // }).isRequired
};

User.defaultProps = {
  avatar: {
    hide: false,
    isLink: false
  },
  isLink: true,
  text: {
    hide: false,
    isLink: false
  }
};

export default User;
