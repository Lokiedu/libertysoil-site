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
import { Link } from 'react-router';


export default class SidebarLink extends React.Component {
  static displayName = 'SidebarLink';
  static propTypes = {
    enabled: React.PropTypes.bool,
    className: React.PropTypes.string,
    activeClassName: React.PropTypes.string
  };

  render() {
    let {
      enabled,
      className,
      activeClassName,
      to,
      children
    } = this.props;

    if (enabled) {
      return <Link className={className} activeClassName={activeClassName} to={to}>{children}</Link>;
    }

    className = className + ' disabled';

    return <span className={className}>{children}</span>;
  }
}
