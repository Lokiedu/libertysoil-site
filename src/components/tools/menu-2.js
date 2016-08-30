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
import { toolsMenu } from '../../utils/menu';


const Menu2 = ({ currentPath }) => {
  function renderItems(items, menuClass = 'tools_menu_2', menuItemClass = 'tools_menu_2__item') {
    if (!items) {
      return null;
    }

    return (
      <ul className={menuClass}>
        {items.map((item, index) => (
          <li key={index}>
            <Link className={menuItemClass} to={item.path}>{item.name}</Link>
            {renderItems(item.children, 'tools_menu_2__submenu', 'tools_menu_2__subitem')}
          </li>
        ))}
      </ul>
    );
  }

  return renderItems(toolsMenu.getCurrentRoot(currentPath).children);
};

Menu2.displayName = 'Menu2';

Menu2.propTypes = {
  currentPath: PropTypes.string
};

export default Menu2;
