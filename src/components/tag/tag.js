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
import omit from 'lodash/omit';

import { castObject } from '../../utils/lang';

import MinifiedTag from './theme/minified';
import BasicTag from './theme/basic';

/**
 * Tag component represented basic tag functionality.
 * Routes tag _theme_ details, doesn't configure tags behaviour.
 *
 * Supports rendering one of the following tag theme classes:
 * - BasicTag    -- common view of tag component
 * - MinifiedTag
 */
export default class Tag extends React.Component {
  static displayName = 'Tag';

  static propTypes = {
    collapsed: PropTypes.bool,
    icon: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape()
    ]),
    inactive: PropTypes.bool,
    name: PropTypes.string,
    size: PropTypes.string,
    theme: PropTypes.string,
    truncated: PropTypes.bool
  };

  static defaultProps = {
    size: 'small'
  };

  shouldComponentUpdate(nextProps) {
    return nextProps !== this.props;
  }

  renderIcon = () => ({
    ...castObject(this.props.icon, 'icon'),
    collapsed: this.props.collapsed,
    size: this.props.size.toLowerCase(),
    inactive: this.props.inactive
  });

  renderName = () => {
    const { collapsed, name, truncated } = this.props;
    return { collapsed, name, truncated };
  };

  getClassName = () => {
    const { className, inactive, size } = this.props;
    return classNames(className, {
      'tag--inactive': inactive,
      [`tag--size_${size.toLowerCase()}`]: size
    });
  }

  render() {
    const htmlProps = omit(this.props, [
      'collapsed', 'inactive', 'theme', 'truncated', 'inactive',
    ]);
    const finalProps = {
      ...htmlProps,
      className: this.getClassName(),
      icon: this.renderIcon(),
      name: this.renderName()
    };

    switch (this.props.theme) {
      case 'min':
        return <MinifiedTag {...finalProps} />;
      default:
        return <BasicTag {...finalProps} />;
    }
  }
}
