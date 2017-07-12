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
import omit from 'lodash/omit';

import CommonIcon from './common';

function translateSize(size) {
  switch (size) {
    case 'small':  return 's';
    case 'big':    return 'm';
    case 'block':  return 'l';
    case 'common': return 'l';
    default:       return size;
  }
}

function translateOutline(outline) {
  const props = {};

  if (typeof outline === 'string') {
    props.bg = outline;
  } else if (outline) {
    props.bg = 'white';
  } else {
    return props;
  }

  props.round = true;
  return props;
}

export default class IconOldTemplate extends React.PureComponent {
  static displayName = 'IconOldTemplate';

  static propTypes = {
    icon: PropTypes.string,
    outline: PropTypes.oneOfType([
      PropTypes.bool,
      PropTypes.string
    ]),
    size: PropTypes.string
  };

  static defaultProps = {
    size: 'small'
  };

  render() {
    return (
      <CommonIcon
        size={translateSize(this.props.size)}
        {...translateOutline(this.props.outline)}
        {...omit(this.props, KNOWN_PROPS)}
      >{this.props.icon}</CommonIcon>
    );
  }
}

const KNOWN_PROPS = Object.keys(IconOldTemplate.propTypes);
