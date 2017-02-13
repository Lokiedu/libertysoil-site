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

import {
  uuid4 as uuid4PropType,
  Immutable as ImmutablePropType
} from '../../prop-types/common';
import {
  ArrayOfUsers as ArrayOfUsersPropType
} from '../../prop-types/users';
import Avatar from '../user/avatar';


export default function UserList({ onClick, users, selectedUserId }) {
  const items = users.map((user, index) => {
    const handleClick = () => onClick(user.get('id'));
    let className = 'tools_item tools_item-clickable';
    if (user.get('id') === selectedUserId) {
      className += ' tools_item-selected';
    }

    return (
      <div
        className={className}
        key={index}
        onClick={handleClick}
      >
        <Avatar size={23} user={user} />
        <span className="tools_item__child-padded">{user.get('username')}</span>
      </div>
    );
  });

  return (
    <div>
      {items}
    </div>
  );
}

UserList.propTypes = {
  onClick: PropTypes.func,
  selectedUserId: uuid4PropType,
  users: ImmutablePropType(ArrayOfUsersPropType).isRequired
};

UserList.defaultParams = {
  onClick: () => { }
};
