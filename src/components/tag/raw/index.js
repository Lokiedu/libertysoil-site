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
import omit from 'lodash/omit';

import { OldIcon as Icon } from '../../icon';
import RawTagName from './name';

const RawTag = ({ aside, icon, name, ...props }) => (
  <div {...omit(props, ['children'])}>
    <Icon {...icon} />
    <RawTagName {...name} />
    {aside}
  </div>
);

RawTag.propTypes = {
  aside: PropTypes.node,
  icon: PropTypes.shape({}),
  name: PropTypes.shape({})
};

RawTag.defaultProps = {
  aside: false,
  icon: {},
  name: {}
};

export default RawTag;
