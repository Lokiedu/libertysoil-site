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
import { connect } from 'react-redux';
import classNames from 'classnames';
import t from 't8on';

import { SUPPORTED_LOCALES } from '../consts/localization';
import messageType from '../consts/messageTypeConstants';
import createSelector from '../selectors/createSelector';

function translateWith(getter, phrase, mode) {
  const res = getter(phrase);
  if (!res && !res.match(/\.+(long|short)$/)) {
    if (mode === 'long') {
      return getter(phrase.concat('.long')) || getter(phrase.concat('.short')) || phrase;
    }

    return getter(phrase.concat('.short')) || getter(phrase.concat('.long')) || phrase;
  }

  return res || phrase;
}

export class UnwrappedMessage extends React.Component {
  static displayName = 'UnwrappedMessage';

  static propTypes = {
    i: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    internal: PropTypes.bool,
    message: PropTypes.string,
    removeMessage: PropTypes.func,
    type: PropTypes.string
  };

  static defaultProps = {
    internal: false
  };

  closeHandler = () => {
    this.props.removeMessage(this.props.i);
  };

  render() {
    const {
      children,
      locale,
      removeMessage,
      type,
      message,
      i,
      internal
    } = this.props;
    let icon = null;
    let close = null;

    const cn = classNames('message', {
      'message-error': type === messageType.ERROR,
      'message-internal': internal,
      'message--rtl': SUPPORTED_LOCALES[locale].rtl
    });

    if (type == messageType.ERROR) {
      icon = <span className="micon message__icon">error</span>;
    }

    if (removeMessage) {
      close = <span className="message__close action micon" onClick={this.closeHandler}>close</span>;
    }

    const translate = t.translateTo(locale);

    return (
      <div className={cn} key={i}>
        {close}
        {icon}
        <div className="message__body">
          {translateWith(translate, message || children)}
        </div>
      </div>
    );
  }
}

const mapStateToProps = createSelector(
  state => state.getIn(['ui', 'locale']),
  locale => ({ locale })
);

export default connect(mapStateToProps)(UnwrappedMessage);
