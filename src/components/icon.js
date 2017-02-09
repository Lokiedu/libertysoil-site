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
import classNames from 'classnames';

import * as MdIconPack from 'react-icons/lib/md';
import { FaHashtag, FaAt } from 'react-icons/lib/fa';

const FaIconPack = { FaHashtag, FaAt };

function findIcon(iconName) {
  const camelized = iconName.replace(/(?:^|[-_])(\w)/g, (match, c) =>
    c ? c.toUpperCase() : ''
  );
  const capitalized = camelized.charAt(0).toUpperCase() + camelized.slice(1);

  return MdIconPack[`Md${capitalized}`] || FaIconPack[`Fa${capitalized}`];
}

const IconComponent = ({
  className,
  color,
  disabled,
  icon,
  onClick,
  outline,
  spin,
  size,
  ...props
}) => {
  const Icon = findIcon(icon);

  const classNameIcon = classNames('icon', {
    'icon-outline': outline,
    'icon-disabled': disabled,
    'micon-rotate': spin,
    [`micon-${size}`]: size,
    [`icon--size_${size}`]: size,
    [className]: className,
  });

  const classNameIconPic = classNames('micon', {
    [`color-${color}`]: color,
    [`micon-${size}`]: size,
    [`icon--size_${size}`]: size
  });

  let renderedIcon = false;
  if (Icon) {
    renderedIcon = <Icon className={classNameIconPic} />;
  }

  let localOnClick = onClick;
  if (disabled) {
    localOnClick = null;
  }

  return (
    <div
      {...props}
      className={classNameIcon}
      disabled={disabled}
      onClick={localOnClick}
    >
      {renderedIcon}
    </div>
  );
};

IconComponent.propTypes = {
  className: PropTypes.string,
  color: PropTypes.string,
  disabled: PropTypes.bool,
  icon: PropTypes.string,
  onClick: PropTypes.func,
  outline: PropTypes.bool,
  size: PropTypes.string,
  spin: PropTypes.bool
};

IconComponent.defaultProps = {
  icon: ''
};

export default IconComponent;
