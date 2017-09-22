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
import { omit } from 'lodash';

export default class TabTitle extends React.Component {
  static displayName = 'TabTitle';

  static propTypes = {
    _toggle: PropTypes.func,
    active: PropTypes.bool,
    activeClassName: PropTypes.string,
    children: PropTypes.node,
    className: PropTypes.string,
    index: PropTypes.number.isRequired,
    onClick: PropTypes.func
  };

  static defaultProps = {
    onClick: () => {}
  };

  clickHandler = () => {
    const { index, onClick, _toggle } = this.props;

    onClick(index);
    _toggle(index);
  };

  render() {
    const {
      active,
      activeClassName,
      className,
      children,
      ...props
    } = this.props;

    let cn = 'tabs__tab_title';
    if (className) {
      cn += ` ${className}`;
    }

    if (active) {
      cn += ' tabs__tab_title-active';

      if (activeClassName) {
        cn += ` ${activeClassName}`;
      }
    }

    return (
      <span {...omit(props, ['toggle', 'onClick'])} className={cn} onClick={this.clickHandler}>
        {children}
      </span>
    );
  }
}
