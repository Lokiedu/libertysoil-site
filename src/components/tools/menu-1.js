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
import { Link } from 'react-router';
import { filter } from 'lodash';

import ClickOutsideComponentDecorator from '../../decorators/ClickOutsideComponentDecorator';
import { toolsMenu } from '../../utils/menu';


class Menu1 extends React.Component {
  static displayName = 'Menu1';

  static propTypes = {
    currentPath: PropTypes.string
  };

  state = {
    opened: false
  };

  handleToggle = () => {
    this.setState({ opened: !this.state.opened });
  };

  onClickOutside = () => {
    this.setState({ opened: false });
  };

  render() {
    const root = toolsMenu.getCurrentRoot(this.props.currentPath);
    const items = filter(toolsMenu.items, item => item.path !== root.path);

    let arrowIcon = 'keyboard_arrow_down';
    if (this.state.opened) {
      arrowIcon = 'keyboard_arrow_up';
    }

    return (
      <div className="tools_page__header tools_menu_1">
        <div className="tools_menu_1__caption">{root.name}</div>
        <div className="tools_menu_1__toggle_dropdown" onClick={this.handleToggle}>
          <span className="micon micon-extra">{arrowIcon}</span>
        </div>
        {this.state.opened &&
          <div className="tools_menu_1__dropdown">
            {items.map((item, index) => (
              <Link className="tools_menu_1__item" key={index} to={item.path}>{item.name}</Link>
            ))}
          </div>
        }
      </div>
    );
  }
}

export default ClickOutsideComponentDecorator(Menu1);
