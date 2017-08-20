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
import React from 'react';
import { omit, pick, transform } from 'lodash';

import Icon from '../icon';

const KNOWN_PROPS = [
  'bg', 'children', 'className',
  'inactive', 'onClick', 'relative',
  'round', 'size', 'type'
];

const PROPS_TO_CAST = [
  'round', 'size'
];

const isUnitForm = (prop) => (
  prop && typeof prop === 'object' && ('inner' in prop || 'outer' in prop)
);

const castBoth = (prop) => {
  if (isUnitForm(prop)) {
    return prop;
  }

  return { inner: prop, outer: prop };
};

const castOne = (prop, partName) => {
  if (isUnitForm(prop)) {
    return prop;
  }

  return { [partName]: prop };
};

export default class IconCommonTemplate extends React.PureComponent {
  static displayName = 'IconCommonTemplate';

  static propTypes = pick(Icon.propTypes, KNOWN_PROPS);

  static defaultProps = pick(Icon.defaultProps, PROPS_TO_CAST);

  render() {
    const p = transform(
      pick(this.props, PROPS_TO_CAST),
      (nextProps, val, key) => (nextProps[key] = castBoth(val), nextProps),
      {}
    );

    p.className = castOne(this.props.className, 'outer');
    p.bg = castOne(this.props.bg, 'outer');

    return (
      <Icon
        bg={p.bg.outer}
        className={p.className.outer}
        inactive={this.props.inactive}
        round={p.round.outer}
        size={p.size.outer}
        relative={this.props.relative}
        type="outer"
        onClick={this.props.onClick}
      >
        <Icon
          bg={p.bg.inner}
          className={p.className.inner}
          round={p.round.inner}
          size={p.size.inner}
          type="inner"
          {...omit(this.props, KNOWN_PROPS)}
        >{this.props.children}</Icon>
      </Icon>
    );
  }
}
