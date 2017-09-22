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
import PropTypes from 'prop-types';

import React from 'react';
import { Link } from 'react-router';

const SidebarLink = ({ activeClassName, children, className, enabled, to }) => {
  if (enabled) {
    return <Link activeClassName={activeClassName} className={className} to={to}>{children}</Link>;
  }

  let cn = 'disabled';
  if (className) {
    cn += ` ${className}`;
  }

  return <span className={cn}>{children}</span>;
};

SidebarLink.displayName = 'SidebarLink';

SidebarLink.propTypes = {
  activeClassName: PropTypes.string,
  children: PropTypes.node,
  className: PropTypes.string,
  enabled: PropTypes.bool,
  to: PropTypes.string
};

export default SidebarLink;
