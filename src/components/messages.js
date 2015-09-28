import React from 'react';
import bem from '../utils/bemClassNames';

import {getStore, removeMessage} from '../store';

import messageType from '../consts/messageTypeConstants';

export default class Messages extends React.Component {
  close (i) {
    getStore().dispatch(removeMessage(i));
  }

  render() {
    let msgTags = this.props.messages.map((msg, i) => {
      var cn = bem.makeClassName({
        block: 'message',
        modifiers: {
          error: () => (msg.type == messageType.ERROR)
        }
      });

      return <div key={i} className={cn}>
        <div className="message__body">
          {msg.message}
        </div>
        <span onClick={this.close.bind(this, i)} className="message__close action fa fa-times"></span>
      </div>;
    })

    return <div className="message__group">{msgTags}</div>
  }
}
