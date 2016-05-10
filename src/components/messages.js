/*
 This file is a part of libertysoil.org website
 Copyright (C) 2015  Loki Education (Social Enterprise)

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


export default class Messages extends React.Component {
  static propTypes = {
    messages: PropTypes.arrayOf(PropTypes.shape({
      message: PropTypes.string.isRequired,
      type: PropTypes.string
    })).isRequired,
    removeMessage: PropTypes.func
  };

  render() {
    if (this.props.messages.length == 0) {
      return <script/>;
    }

    const messages = this.props.messages.map((msg, i) => {
      const params = { i, key: i, message: msg.message, type: msg.type, removeMessage: this.props.removeMessage };
      return <Message {...params} />;
    })

    return (
      <div className="message__group">
        {messages}
      </div>
    );
  }
}
