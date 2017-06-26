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

import Message from './message';


export default class Conversation extends React.Component {
  static propTypes = {
    onDelete: PropTypes.func,
    onUpdate: PropTypes.func
  };

  static defaultProps = {
    onDelete: () => { },
    onUpdate: () => { }
  };

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.onSend(this.props.selectedUser.get('id'), this.form.text.value);
    this.form.text.value = '';
  };

  render() {
    const {
      current_user,
      messages,
      users
    } = this.props;

    const messageElements = messages.map((message, index) => {
      const hideAvatar = index > 0 && messages.getIn([index - 1, 'sender_id']) === message.get('sender_id');
      const author = users.get(message.get('sender_id'));

      return (
        <div
          className="conversations__message"
          key={message.get('id')}
        >
          <Message
            current_user={current_user}
            hideAvatar={hideAvatar}
            post={message}
            author={author}
            onUpdate={this.props.onUpdate}
            onDelete={this.props.onDelete}
          />
        </div>
      );
    });

    return (
      <div className="conversations">
        <div className="conversations__messages">
          {messageElements}
        </div>
      </div>
    );
  }
}
