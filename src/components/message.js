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

const id1 = x => x;

const isRTL = (props) => {
  if (props.rtl !== undefined) {
    return props.rtl;
  }

  if (props.locale) {
    const options = SUPPORTED_LOCALES[props.locale];
    return options && options.rtl;
  }

  return false;
};

const getTranslate = (props) => {
  const { translate } = props;
  if (translate === false) {
    return id1;
  }

  if (translate instanceof Function) {
    return translate;
  }

  if (props.locale) {
    return t.translateTo(props.locale);
  }

  return id1;
};

export class UnwrappedMessage extends React.PureComponent {
  static displayName = 'UnwrappedMessage';

  static propTypes = {
    children: PropTypes.string,
    i: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    internal: PropTypes.bool,
    locale: PropTypes.string, // eslint-disable-line react/no-unused-prop-types
    message: PropTypes.string,
    removeMessage: PropTypes.func,
    rtl: PropTypes.bool, // eslint-disable-line react/no-unused-prop-types
    translate: PropTypes.oneOfType([ // eslint-disable-line react/no-unused-prop-types
      PropTypes.func,
      PropTypes.bool
    ]),
    type: PropTypes.string
  };

  static defaultProps = {
    internal: false
  };

  constructor(props, ...args) {
    super(props, ...args);

    this.isRTL = isRTL(props);
    this.translate = getTranslate(props);
  }

  componentWillUpdate(nextProps) {
    this.isRTL = isRTL(nextProps);
    this.translate = getTranslate(nextProps);
  }

  handleClose = () => {
    this.props.removeMessage(this.props.i);
  };

  render() {
    const { type } = this.props;

    const cn = classNames(
      'message', this.props.className,
      {
        'message-error': type === messageType.ERROR,
        'message-internal': this.props.internal,
        'message--rtl': this.isRTL
      }
    );

    let icon;
    if (type === messageType.ERROR) {
      icon = (
        <span className="micon message__icon">
          error
        </span>
      );
    }

    let close;
    if (this.props.removeMessage) {
      close = (
        <span
          className="message__close action micon"
          onClick={this.handleClose}
        >
          close
        </span>
      );
    }

    return (
      <div className={cn}>
        {close}
        {icon}
        <div className="message__body">
          {translateWith(
            this.translate,
            this.props.message || this.props.children
          )}
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
