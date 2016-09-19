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

import NavigationItem from '../navigation-item';
import Icon from '../icon';

/**
 * An example of bookmark object
  {
    className: 'navigation-item--color_blue',
    to: '/bookmark-url',
    title: 'Bookmark Example',
    icon: { icon: 'public' }
  }
**/

export default class Bookmark extends React.Component {
  static propTypes = {
    i: PropTypes.number,
    onSettingsClick: PropTypes.func,
    title: PropTypes.string
  };

  static defaultProps = {
    onSettingsClick: () => {}
  };

  handleSettingsClick = (e) => {
    const { i, onSettingsClick } = this.props;

    e.preventDefault();
    onSettingsClick(i);
  };

  render() {
    const { title, ...props } = this.props;

    return (
      <NavigationItem
        badge={<Icon icon="settings" onClick={this.handleSettingsClick} />}
        theme="2.0"
        {...props}
      >
        {title}
      </NavigationItem>
    );
  }
}
