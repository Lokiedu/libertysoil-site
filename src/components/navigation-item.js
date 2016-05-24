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

import Icon from './icon';

const SidebarLink = ({
  icon,
  badge,
  className,
  enabled,
  to,
  children
}) => {
  let cn = 'navigation__item';
  if (className) {
    cn += ` ${className}`;
  }

  if (!enabled) {
    cn += ' navigation__item-disabled';
  }

  let iconRender;
  if (icon) {
    iconRender = (
      <div className="navigation__icon">
        <Icon icon={icon} />
      </div>
    );
  }

  return (
    <Link activeClassName="navigation__item-active" className={cn} to={to}>
      {iconRender}
      <div className="navigation__title">{children}</div>
      <div className="navigation__badge">{badge}</div>
    </Link>
  );
};

SidebarLink.displayName = 'SidebarLink';

SidebarLink.propTypes = {
  badge: PropTypes.node,
  children: PropTypes.node,
  className: PropTypes.string,
  enabled: PropTypes.bool,
  icon: PropTypes.string,
  to: PropTypes.string
};

export default SidebarLink;
