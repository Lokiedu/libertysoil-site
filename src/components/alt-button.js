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

import { OldIcon as Icon } from './icon';

export default class AltButton extends React.Component {
  static defaultClassName = [
    'layout',
    'layout-align_vertical',
    'layout-align_center',
    'form__input',
    'form__alt-item'
  ].join(' ');

  static displayName = 'AltButton';

  static propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,
    icon: PropTypes.oneOfType([
      PropTypes.shape(Icon.propTypes),
      PropTypes.string
    ]),
    theme: PropTypes.string
  };

  static defaultProps = {
    theme: 'paper'
  };

  shouldComponentUpdate(nextProps) {
    return nextProps !== this.props;
  }

  render() {
    const cn = classNames(
      this.props.className,
      AltButton.defaultClassName,
      this.props.theme &&
        `form__alt-item--theme_${this.props.theme}`
    );

    let finalIcon;

    const { icon } = this.props;
    if (typeof icon === 'object') {
      finalIcon = icon;
    } else {
      finalIcon = {
        size: 'big',
        color: 'gray',
        icon
      };
    }

    const restProps = omit(this.props, KNOWN_PROPS);

    return (
      <button className={cn} type="button" {...restProps}>
        <Icon {...finalIcon} />
        {this.props.children}
      </button>
    );
  }
}

const KNOWN_PROPS = Object.keys(AltButton.propTypes);
