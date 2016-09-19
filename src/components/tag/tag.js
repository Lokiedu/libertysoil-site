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
import { assign, omit, pick } from 'lodash';

import { castObject } from '../../utils/lang';

import MinifiedTag from './theme/minified-tag';
import BasicTag from './theme/basic-tag';

export default class Tag extends React.Component {
  static displayName = 'Tag';

  static propTypes = {
    className: PropTypes.string,
    collapsed: PropTypes.bool,
    icon: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape()
    ]),
    name: PropTypes.string,
    size: PropTypes.string,
    theme: PropTypes.string,
    truncated: PropTypes.bool
  };

  static defaultProps = {
    size: ''
  };

  renderIcon = () => (
    assign({}, castObject(this.props.icon, 'icon'), {
      size: this.props.size.toLowerCase()
    })
  );

  renderName = () => (
    pick(this.props, ['collapsed', 'name', 'truncated'])
  );

  render() {
    const htmlProps = omit(this.props, ['collapsed', 'size', 'theme', 'truncated']);
    const finalProps = assign({}, htmlProps, {
      icon: this.renderIcon(),
      name: this.renderName()
    });

    switch (this.props.theme) {
      case 'min':
        return <MinifiedTag {...finalProps} />;
      default:
        return <BasicTag {...finalProps} />;
    }
  }
}
