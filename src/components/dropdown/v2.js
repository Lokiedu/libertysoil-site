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
import omit from 'lodash/omit';

import ClickOutsideComponentDecorator from '../../decorators/ClickOutsideComponentDecorator';
import { OldIcon as Icon } from '../icon';

class OpenedDropdownV2Content extends React.Component {
  static propTypes = {
    children: PropTypes.node,
    icon: PropTypes.node,
    onClose: PropTypes.func
  };

  shouldComponentUpdate(nextProps) {
    return nextProps !== this.props;
  }

  onClickOutside = () => {
    this.props.onClose();
  };

  render() {
    return (
      <div>
        <div className="dropdown__trigger action" onClick={this.props.onClose}>
          {this.props.icon}
        </div>
        {this.props.children &&
          <div className="dropdown__body">
            {this.props.children}
          </div>
        }
      </div>
    );
  }
}

const Body = ClickOutsideComponentDecorator(OpenedDropdownV2Content);

const ICON_SIZE = { inner: 'lm', outer: 's' };

export const defaultIcon = (
  <Icon icon="arrow_drop_down" size={ICON_SIZE} />
);

export default class DropdownV2 extends React.Component {
  static displayName = 'DropdownV2';

  static propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,
    disabled: PropTypes.bool,
    icon: PropTypes.node,
    iconClosed: PropTypes.node,
    iconOpen: PropTypes.node,
    isVisible: PropTypes.bool,
    theme: PropTypes.string
  };

  static defaultProps = {
    disabled: false,
    isVisible: false,
    theme: 'old'
  };

  constructor(props, ...args) {
    super(props, ...args);
    this.state = {
      isVisible: props.isVisible
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.disabled && !this.props.disabled) {
      this.setState({ isVisible: false });
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return nextProps !== this.props
        || nextState.isVisible !== this.state.isVisible;
  }

  toggleVisibility = () => {
    if (!this.props.disabled) {
      this.setState({ isVisible: !this.state.isVisible });
    }
  };

  render() {
    const { className, icon, iconOpen, iconClosed, ...props } = this.props;

    let i;
    if (icon) {
      i = icon;
    } else if (!this.state.isVisible && iconClosed) {
      i = iconClosed;
    } else if (this.state.isVisible && iconOpen) {
      i = iconOpen;
    } else {
      i = defaultIcon;
    }

    let body;
    let dropdownClassName = classNames(
      'dropdown',
      `dropdown--theme_${this.props.theme}`,
      className
    );
    if (this.state.isVisible) {
      dropdownClassName += ' dropdown-open';
      body = (
        <Body icon={i} onClose={this.toggleVisibility}>
          {this.props.children}
        </Body>
      );
    } else {
      dropdownClassName += ' dropdown-closed';
      body = (
        <div className="dropdown__trigger action" onClick={this.toggleVisibility}>
          {i}
        </div>
      );
    }

    return (
      <div className={dropdownClassName} {...omit(props, ['children'])}>
        {body}
      </div>
    );
  }
}
