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
import React from 'react';
import classNames from 'classnames';

import * as MdIconPack from 'react-icons/lib/md';

function findIcon(iconName) {
  const camelized = iconName.replace(/(?:^|[-_])(\w)/g, (match, c) =>
    c ? c.toUpperCase() : ''
  );

  const query = `Md${camelized.charAt(0).toUpperCase() + camelized.slice(1)}`;
  return MdIconPack[query];
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
  if (!Icon) {
    return <div>{`Please import '${icon}' from react-icons/lib/md`}</div>;
  }

  const classNameIcon = classNames('icon', {
    'icon-outline': outline,
    'icon-disabled': disabled,
    'icon-rotate': spin,
    [`micon-${size}`]: size,
    [`icon-${size}`]: size,
    [className]: className,
  });

  const classNameIconPic = classNames('micon', {
    [`color-${color}`]: color,
    [`micon-${size}`]: size,
    [`icon-${size}`]: size
  });

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
      <Icon className={classNameIconPic} />
    </div>
  );
};

export default IconComponent;
