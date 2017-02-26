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
import Avatar from '../user/avatar';


export default function UserList({ onClick, selectedUserId, users, user_messages }) {
  const followedUsers = user_messages.get('messageableUserIds').map(id => users.get(id));

  const userItems = followedUsers.map((user, index) => {
    const userId = user.get('id');
    const handleClick = () => onClick(userId);
    const isSelected = selectedUserId === userId;
    const numUnread = user_messages.getIn(['byUser', userId, 'numUnread']);
    let className = 'aux-nav__link';
    if (isSelected) {
      className += ' aux-nav__link--active';
    }

    return (
      <div
        className="aux-nav__item"
        key={index}
      >
        <Link className={className} href="javascript:;" onClick={handleClick}>
          <Avatar className="aux-nav__icon--left" isRound={false} size={23} user={user} />
          {user.get('username')}
          {numUnread > 0 &&
            <div className="aux-nav__count">{numUnread}</div>
          }
        </Link>
      </div>
    );
  });

  return (
    <div className="aux-nav">
      {userItems}
    </div>
  );
}
