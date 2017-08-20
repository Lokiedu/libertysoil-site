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
import React from 'react';
import classNames from 'classnames';

import Dropdown from '../../dropdown';
import RiverItem from '../item';

const CLOSED_DROPDOWN_ICON = {
  color: 'grey',
  icon: 'fiber-manual-record'
};

export default class BasicRiverItem extends React.Component {
  shouldComponentUpdate(nextProps) {
    return nextProps !== this.props;
  }

  render() {
    const { children, className, icon, menuItems } = this.props;
    return (
      <RiverItem
        className={classNames('river-item--theme_basic', className)}
        icon={icon &&
          <div className="river-item__icon">
            {icon}
          </div>
        }
        menu={menuItems &&
          <div className="river-item__menu">
            <Dropdown iconClosed={CLOSED_DROPDOWN_ICON} theme="new">
              {menuItems}
            </Dropdown>
          </div>
        }
      >
        {children &&
          <div className="river-item__body">
            {children}
          </div>
        }
      </RiverItem>
    );
  }
}
