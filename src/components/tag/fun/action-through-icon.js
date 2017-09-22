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
import classNames from 'classnames';

import { castObject } from '../../../utils/lang';

import Tag from '../tag';

/**
 * Overrides strategy of tags to handle click events.
 * Makes only tag's icon to be clickable.
 */
const TagWithActionThroughIcon = ({ action, icon, onClick, ...props }) => {
  const iconConf = castObject(icon, 'icon');
  const finalIconClassName = classNames(`tag__icon--action_${action}`, {
    [iconConf.className]: !!iconConf.className
  });
  const finalIconConf = {
    ...iconConf,
    onClick,
    className: finalIconClassName
  };

  return (
    <Tag icon={finalIconConf} {...props} />
  );
};

TagWithActionThroughIcon.propTypes = {
  action: PropTypes.string,
  icon: PropTypes.oneOfType([
    PropTypes.shape({}),
    PropTypes.string
  ]),
  onClick: PropTypes.func
};

TagWithActionThroughIcon.defaultProps = {
  action: '',
  onClick: () => {}
};

export default TagWithActionThroughIcon;
