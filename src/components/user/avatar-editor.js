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

import { User as UserPropType } from '../../prop-types/users';

import { AVATAR_SIZE } from '../../consts/profileConstants';
import UpdatePicture from '../update-picture/update-picture';

export default class AvatarEditor extends React.Component {
  static displayName = 'AvatarEditor';

  static propTypes = {
    flexible: PropTypes.bool,
    limits: PropTypes.shape({}),
    onUpdateAvatar: PropTypes.func,
    preview: PropTypes.shape({}),
    user: UserPropType.isRequired
  };

  static defaultProps = {
    flexible: false,
    limits: {
      min: AVATAR_SIZE
    },
    preview: AVATAR_SIZE,
    onUpdateAvatar: () => {}
  };

  render() {
    const {
      user,
      flexible,
      limits,
      preview,
      onUpdateAvatar
    } = this.props;

    let modalName = <span className="font-bold">{user.username}</span>;

    if (user.more) {
      if (user.more.firstName || user.more.lastName) {
        modalName = [
          <span className="font-bold" key="avatarEditorName">{user.more.firstName} {user.more.lastName}</span>,
          ` (${user.username})`
        ];
      }
    }

    return (
      <UpdatePicture
        flexible={flexible}
        limits={limits}
        preview={preview}
        what="profile picture"
        where={modalName}
        onSubmit={onUpdateAvatar}
      />
    );
  }
}
