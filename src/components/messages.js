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

import { ArrayOfMessages as ArrayOfMessagesPropType } from '../prop-types/messages';

import Message from './message';

export default class Messages extends React.PureComponent {
  static displayName = 'Messages';

  static propTypes = {
    innerProps: PropTypes.shape({}),
    messages: ArrayOfMessagesPropType.isRequired,
    removeMessage: PropTypes.func
  };

  static defaultProps = {
    innerProps: {}
  };

  render() {
    const { messages } = this.props;
    if (messages.isEmpty()) {
      return false;
    }

    const { innerProps, removeMessage } = this.props;

    return (
      <div className="message__group">
        {messages.map(msg =>
          <Message
            i={msg.get('id')}
            key={msg.get('id')}
            message={msg.get('message')}
            removeMessage={removeMessage}
            type={msg.get('type')}
            {...innerProps}
          />
        )}
      </div>
    );
  }
}
