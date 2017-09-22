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
import PropTypes from 'prop-types';

import React from 'react';
import classNames from 'classnames';

const SidebarAlt = ({ children, side }) => (
  <div className={classNames('page__sidebar page__sidebar--type_alt', `page__sidebar--side_${side}`)}>
    {children}
  </div>
);

SidebarAlt.displayName = 'SidebarAlt';

SidebarAlt.propTypes = {
  children: PropTypes.node,
  side: PropTypes.oneOf(['left', 'right'])
};

SidebarAlt.defaultProps = {
  side: 'right'
};

export default SidebarAlt;
