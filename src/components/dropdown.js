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
import React, { Component } from 'react';
import classNames from 'classnames';

import ClickOutsideComponentDecorator from '../decorators/ClickOutsideComponentDecorator';
import Icon from './icon';

class Dropdown extends Component {
  static displayName = 'Dropdown';

  static defaultProps = {
    theme: 'old'
  };

  constructor(props) {
    super(props);

    this.state = {
      isVisible: props.isVisible || false
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    return nextProps !== this.props
        || nextState.isVisible !== this.state.isVisible;
  }

  onClickOutside = () => {
    this.hide();
  };

  toggleVisibility = () => {
    this.setState({ isVisible: !this.state.isVisible });
  };

  hide = () => {
    this.setState({ isVisible: false });
  };

  render() {
    const { className, icon, iconOpen, iconClosed, theme, ...props } = this.props;

    const dropdownClassName =
      classNames('dropdown', `dropdown--theme_${theme}`, className, {
        'dropdown-open': this.state.isVisible,
        'dropdown-closed': !this.state.isVisible
      });

    let i;
    if (icon) {
      i = icon;
    } else if (!this.state.isVisible && iconClosed) {
      i = iconClosed;
    } else if (this.state.isVisible && iconOpen) {
      i = iconOpen;
    } else {
      i = 'arrow_drop_down';
    }

    return (
      <div className={dropdownClassName} {...props}>
        <div className="dropdown__trigger action" onClick={this.toggleVisibility}>
          <Icon className="micon micon-small" icon={i} />
        </div>
        <div className="dropdown__body">
          {props.children}
        </div>
      </div>
    );
  }
}

const DecoratedDropdown = ClickOutsideComponentDecorator(Dropdown);
export default DecoratedDropdown;
