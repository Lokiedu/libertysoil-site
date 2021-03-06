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
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

export default function NavigationItemSwitch(props) {
  const className = classNames(
    'navigation-item__switch',
    { 'navigation-item__switch--truncated': props.truncated }
  );

  return (
    <div className={className} onClick={props.onClick} />
  );
}

NavigationItemSwitch.displayName = 'NavigationItemSwitch';

NavigationItemSwitch.propTypes = {
  onClick: PropTypes.func,
  truncated: PropTypes.bool
};
