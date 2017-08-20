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

import { OldIcon as Icon } from './icon';

export default class AltButton extends React.Component {
  static defaultClassName = [
    'layout',
    'layout-align_vertical',
    'layout-align_center',
    'form__input',
    'bio__post--type_text',
    'form__alt-item'
  ].join(' ');

  static displayName = 'AltButton';

  static propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,
    icon: PropTypes.oneOfType([
      PropTypes.shape(),
      PropTypes.string
    ])
  };

  shouldComponentUpdate(nextProps) {
    return nextProps !== this.props;
  }

  render() {
    const { children, className, icon, ...props } = this.props;
    const cn = classNames(className, AltButton.defaultClassName);

    let finalIcon;
    if (typeof icon === 'object') {
      finalIcon = {
        ...icon
      };
    } else {
      finalIcon = {
        size: 'big',
        color: 'gray',
        icon
      };
    }

    return (
      <button className={cn} type="button" {...props}>
        <Icon {...finalIcon} />
        {children}
      </button>
    );
  }
}
