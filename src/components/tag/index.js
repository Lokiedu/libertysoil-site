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
import { assign, pick } from 'lodash';

import TagWithActionThroughIcon from './fun/action-through-icon';
import TagAsLink from './fun/tag-as-link';
import Tag from './tag';

export default class TagSwitch extends React.Component {
  static propTypes = {
    action: PropTypes.string,
    isLink: PropTypes.bool,
    name: PropTypes.string,
    onClick: PropTypes.func,
    type: PropTypes.string,
    urlId: PropTypes.string
  };

  static defaultProps = {
    isLink: false,
    onClick: () => {}
  };

  handleClick = () => {
    const tagInfo = pick(this.props, ['name', 'type', 'urlId']);
    this.props.onClick(tagInfo);
  };

  render() {
    const { action, isLink, ...props } = this.props;
    const propsToChildren = assign({}, props, {
      action,
      onClick: this.handleClick
    });

    if (action) {
      return <TagWithActionThroughIcon {...propsToChildren} />;
    }

    if (isLink) {
      return <TagAsLink {...propsToChildren} />;
    }

    return <Tag {...propsToChildren} />;
  }
}
