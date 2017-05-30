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
import { fromJS } from 'immutable';

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
    // eslint-disable-next-line react/no-unused-prop-types
    index: PropTypes.number,
    onSettingsClick: PropTypes.func,
    title: PropTypes.string,
    url: PropTypes.string
  };

  static defaultProps = {
    onSettingsClick: () => {},
    icon: 'star'
  };

  constructor(...args) {
    super(...args);

    this.iconComponent = (
      <Icon icon="settings" onClick={this.handleSettingsClick} />
    );
  }

  handleSettingsClick = (e) => {
    e.preventDefault();
    this.props.onSettingsClick(this.props.id);
  };

  render() {
    const { description, icon, title, url } = this.props;

    return (
      <NavigationItem
        className="navigation-item--color_blue"
        badge={this.iconComponent}
        icon={fromJS({ icon })}
        theme="2.0"
        to={url}
        title={description}
      >
        {title}
      </NavigationItem>
    );
  }
}
