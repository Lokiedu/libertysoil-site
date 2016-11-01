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

const Messages = ({ messages, removeMessage }) => {
  if (messages.isEmpty()) {
    return null;
  }

  const messagesToRender = messages.map((msg, i) => {
    return <Message i={i} key={i} message={msg.get('message')} removeMessage={removeMessage} type={msg.get('type')} />;
  });

  return (
    <div className="message__group">
      {messagesToRender}
    </div>
  );
};

Messages.displayName = 'Messages';

Messages.propTypes = {
  messages: ArrayOfMessagesPropType.isRequired,
  removeMessage: PropTypes.func
};

export default Messages;
