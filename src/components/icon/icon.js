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

import * as MdIconPack from 'react-icons/lib/md';
import * as FaIconPack from 'react-icons/lib/fa';

function findIcon(iconName, packName) {
  const camelized = iconName.replace(/(?:^|[-_])(\w)/g, (match, c) =>
    c ? c.toUpperCase() : ''
  );
  const capitalized = camelized.charAt(0).toUpperCase() + camelized.slice(1);

  if (packName === 'md') {
    return MdIconPack[`Md${capitalized}`];
  }
  if (packName === 'fa') {
    return FaIconPack[`Fa${capitalized}`];
  }
  return MdIconPack[`Md${capitalized}`] || FaIconPack[`Fa${capitalized}`];
}

/**
 * Typical icons presented in the project have two parts:
 * 1. Inner part - represents the dimention of internal picture;
 * 2. Outer part - determines the size of outline.
 *
 * If these two entites aren't separated, it may be difficult
 * to create all desired variations without a bunch of
 * customization every time.
 *
 * There are different icons in the project which can't be fit
 * to the limits of just "small" and "big" size options.
 * This is where "common" and "block" options take place.
 *
 * However, they don't provide an opportunity to cover
 * the whole required range of icons' dimentions.
 * So each module usually has to manage its own version of icon
 * instead of using predefined (and predictable!) sizing options.
 *
 * Icon component is re-implemented to the current state
 * to isolate the inner and outer parts and manage their behaviour
 * independently from each other.
 *
 * Note: Icon component presented further is a unit, just a building block now.
 * This is more convenient to use templates in order to create common icons.
 * See ./templates/common.js for details.
 */
export default class Icon extends React.PureComponent {
  static defaultClassName = 'icon';
  static displayName = 'Icon';

  static propTypes = {
    className: PropTypes.string,
    color: PropTypes.string,
    disabled: PropTypes.bool,
    inactive: PropTypes.bool,
    name: PropTypes.string,
    onClick: PropTypes.func,
    pack: PropTypes.oneOf(['md', 'fa']),
    relative: PropTypes.bool,
    round: PropTypes.bool,
    size: PropTypes.string,
    spin: PropTypes.bool,
    type: PropTypes.oneOf(['inner', 'outer'])
  };

  static defaultProps = {
    disabled: false,
    inactive: false,
    name: '',
    relative: false,
    round: false,
    size: 's',
    spin: false,
    type: 'inner'
  };

  render() {
    const { children } = this.props;
    let name, icon, type = this.props.type;

    if (!children) {
      name = this.props.name;
    } else if (typeof children === 'string') {
      name = children;
    } else {
      icon = children;

      if (!type && icon.type !== 'svg') {
        type = 'outer';
      }
    }

    if (!type) {
      type = 'inner';
    }

    const { pack } = this.props;

    if (!icon) {
      if (!name) {
        return false;
      }

      const IconComponent = findIcon(name, pack);
      if (IconComponent) {
        icon = <IconComponent />;
      } else {
        icon = name;
      }
    }

    const { bg, color } = this.props;

    let cn = classNames(
      Icon.defaultClassName,
      this.props.className,
      `icon--type_${type}`,
      {
        [`icon--bg_${bg}`]: bg,
        [`icon--color_${color} color-${color}`]: color,
        [`icon--font_${pack}`]: icon === name,
        'icon--inactive': this.props.inactive,
        'icon--round': this.props.round,
        'icon--spin': this.props.spin
      }
    );

    let sizing;
    if (type === 'outer') {
      if (this.props.relative) {
        sizing = ' icon--padding_';
      } else {
        sizing = ' icon--fsize_';
      }
    } else {
      sizing = ' icon--size_';
    }

    cn += sizing.concat(this.props.size);

    let handleClick;
    if (this.props.disabled) {
      handleClick = null;
    } else {
      handleClick = this.props.onClick;
    }

    return (
      <div className={cn} onClick={handleClick}>
        {icon}
      </div>
    );
  }
}
