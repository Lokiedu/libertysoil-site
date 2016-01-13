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

import bem from '../utils/bemClassNames';
import messageType from '../consts/messageTypeConstants';


export default class Message extends React.Component {
  static propTypes = {
    i: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    message: PropTypes.string.isRequired,
    removeMessage: PropTypes.func.isRequired,
    type: PropTypes.string
  };

  closeHandler = () => {
    this.props.removeMessage(this.props.i);
  };

  render() {
    let {
      type,
      message,
      i
    } = this.props;
    let icon = null;

    let cn = bem.makeClassName({
      block: 'message',
      modifiers: {
        error: () => (type == messageType.ERROR)
      }
    });

    if (type == messageType.ERROR) {
      icon = <span className="micon message__icon">error</span>
    }

    return (
      <div className={cn} key={i}>
        <span className="message__close action micon" onClick={this.closeHandler}>close</span>
        {icon}
        <div className="message__body">
          {message}
        </div>
      </div>
    );
  }
}
