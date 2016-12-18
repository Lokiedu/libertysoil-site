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

import Avatar from '../user/avatar';
import Time from '../time';
import { Immutable as ImmutablePropType } from '../../prop-types/common';
import { User as UserPropType } from '../../prop-types/users';


function Message({ currentUser, selectedUser, message, hideAvatar = false }) {
  const isMyMessage = message.get('sender_id') === currentUser.get('id');
  let className = 'conversations_tool__message';
  if (isMyMessage) {
    className += ' conversations_tool__message-my';
  } else {
    className += ' conversations_tool__message-their';
  }

  let user = currentUser;
  if (!isMyMessage) {
    user = selectedUser;
  }

  return (
    <div className={className}>
      <Time className="conversations_tool__time" timestamp={message.get('created_at')} />
      {!hideAvatar &&
        <Avatar className="conversations_tool__avatar" size={32} user={user} />
      }
      {message.get('text')}
    </div>
  );
}

export default class Conversation extends React.Component {
  static propTypes = {
    currentUser: ImmutablePropType(UserPropType.isRequired),
    messages: ImmutablePropType(PropTypes.shape({})),
    selectedUser: ImmutablePropType(UserPropType)
  };

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.onSend(this.props.selectedUser.get('id'), this.form.text.value);
    this.form.text.value = '';
  };

  render() {
    const {
      currentUser,
      messages,
      selectedUser,
    } = this.props;

    if (!selectedUser) {
      return null;
    }

    const messageElements = messages.map((message, index) => {
      const hideAvatar = index > 0 && messages.getIn([index - 1, 'sender_id']) === message.get('sender_id');

      return (
        <Message
          currentUser={currentUser}
          hideAvatar={hideAvatar}
          key={message.get('id')}
          message={message}
          selectedUser={selectedUser}
        />
      );
    });

    return (
      <div>
        <div className="conversations_tool__messages">
          {messageElements}
        </div>
        <form ref={c => this.form = c} onSubmit={this.handleSubmit}>
          <textarea
            className="input input-block conversations_tool__input"
            name="text"
            placeholder={'Type your message here, hit "enter" or "Send" button'}
          />
          <input className="button button-red" type="submit" value="Send" />
        </form>
      </div>
    );
  }
}
