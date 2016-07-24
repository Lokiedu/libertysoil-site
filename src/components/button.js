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

const Button = ({ color, size, className, waiting, title, type, ...props }) => {
  let icon = null;
  let cn = 'button action';
  let t = 'button';

  if (type) {
    t = type;
  }

  if (className) {
    cn += ` ${className}`;
  }

  if (color) {
    cn += ` button-${color}`;
  }

  if (size) {
    cn += ` button-${size}`;
  }

  if (waiting) {
    cn += ` button-waiting`;
    icon = <span className="button__icon micon micon-rotate">refresh</span>;
  }

  if (icon) {
    cn += ' button-icon';
  }

  return (
    <button className={cn} title={title} type={t} {...props}>
      {icon}
      {title}
    </button>
  );
};

Button.displayName = 'Button';

Button.propTypes = {
  className: PropTypes.string,
  color: PropTypes.string,
  size: PropTypes.string,
  title: PropTypes.string,
  type: PropTypes.oneOf(['button', 'reset', 'submit']),
  waiting: PropTypes.bool
};

Button.defaultProps = {
  color: 'green'
};

export default Button;
