/*
 This file is a part of libertysoil.org website
 Copyright (C) 2017  Loki Education (Social Enterprise)

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
import classNames from 'classnames';
import CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';
import omit from 'lodash/omit';

import { OldIcon as Icon } from '../../icon';

const STATUS_ICONS = {
  invalid: {
    className: 'color-red form__check',
    icon: 'close',
    pack: 'fa'
  },
  valid: {
    className: 'color-green form__check',
    icon: 'check',
    pack: 'fa'
  },
  unfilled: {}
};

const ANIMATION_PROPS = {
  component: 'div',
  transitionAppear: true,
  transitionAppearTimeout: 250,
  transitionLeave: true,
  transitionLeaveTimeout: 250,
  transitionName: 'form__message--transition'
};

const DOT_ICON_SIZE = { outer: 'l', inner: 's' };

export default class FormField extends React.Component {
  static propTypes = {
    animated: PropTypes.bool,
    className: PropTypes.string,
    dotColor: PropTypes.string,
    error: PropTypes.string,
    name: PropTypes.string,
    refFn: PropTypes.func,
    statusIcon: PropTypes.shape({}),
    title: PropTypes.string,
    type: PropTypes.string,
    value: PropTypes.oneOfType([
      PropTypes.bool,
      PropTypes.string
    ]),
    warn: PropTypes.string
  };

  static defaultProps = {
    statusIcon: {},
    theme: 'paper',
    type: 'text'
  };

  shouldComponentUpdate(nextProps) {
    return nextProps !== this.props;
  }

  render() {
    const { animated, error, name, type, value, warn } = this.props;

    let dotColor = 'gray', icon;
    if (error) {
      dotColor = 'red';
      icon = 'invalid';
    } else if (value) {
      icon = 'valid';
    } else {
      icon = 'unfilled';
    }

    if (this.props.dotColor) {
      dotColor = this.props.dotColor;
    }

    const cn = classNames(
      'form__row form__field form__background--bright',
      this.props.className,
      {
        'form__field--checkbox': type === 'checkbox'
      }
    );

    const dot = (
      <Icon
        className="form__dot"
        color={dotColor}
        icon="fiber-manual-record"
        size={DOT_ICON_SIZE}
      />
    );

    let inputClassName = 'form__input river-item input-transparent';
    if (this.props.theme) {
      inputClassName += ` form__input--theme_${this.props.theme}`;
    }

    const input = (
      <input
        className={inputClassName}
        id={name}
        name={name}
        ref={this.props.refFn}
        type={type}
        value={value}
        {...omit(this.props, KNOWN_PROPS)}
      />
    );

    const status = (
      <Icon
        className="form__check"
        size="big"
        {...STATUS_ICONS[icon]}
        {...this.props.statusIcon}
      />
    );

    let body;

    switch (type) {
      case 'checkbox': {
        const label = (
          <label htmlFor={name}>
            {input}
            <span aria-hidden="true" className="fa fa-check" />
            <div className="form__label">{this.props.title}</div>
          </label>
        );

        body = (
          <div>
            <div className="layout layout-align_vertical">
              {dot}{label}{status}
            </div>
          </div>
        );

        break;
      }
      default: {
        const label = (
          <label className="form__label" htmlFor={name}>
            {this.props.title}
          </label>
        );

        body = (
          <div>
            {label}
            <div className="layout layout-align_vertical">
              {dot}{input}{status}
            </div>
          </div>
        );
      }
    }

    const errorMessage = error && (
      <div className="form__field-message">
        {error}
      </div>
    );
    const warnMessage = warn && (
      <div className="form__field-message form__field-message--type_info">
        {warn}
      </div>
    );

    let messages;
    if (animated) {
      messages = (
        <div>
          <CSSTransitionGroup {...ANIMATION_PROPS}>
            {errorMessage}
          </CSSTransitionGroup>
          <CSSTransitionGroup {...ANIMATION_PROPS}>
            {warnMessage}
          </CSSTransitionGroup>
        </div>
      );
    } else {
      messages = (
        <div>
          {errorMessage}
          {warnMessage}
        </div>
      );
    }

    return (
      <div className={cn} key={name}>
        {body}
        {messages}
      </div>
    );
  }
}

const KNOWN_PROPS = Object.keys(FormField.propTypes);
