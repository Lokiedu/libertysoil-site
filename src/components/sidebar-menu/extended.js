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
import React from 'react';

import { CurrentUser as CurrentUserPropType } from '../../prop-types/users';
import { MENU_ITEMS } from '../../consts/sidebar-menu';

import Navigation from '../navigation';
import NavigationItem from '../navigation-item';

export default class SidebarMenuExtended extends React.Component {
  static propTypes = {
    current_user: CurrentUserPropType
  };

  renderNews = () => {
    const { current_user: { user = {} } } = this.props;
    const { username } = user;
    const { news: menuItem } = MENU_ITEMS;

    const unreadPosts = 4;

    let menuItemContent = menuItem.title.normal;
    if (unreadPosts) {
      menuItemContent += `: ${unreadPosts} new posts`;
    }

    return (
      <NavigationItem
        badge={unreadPosts}
        icon={menuItem.icon}
        theme="2.0"
        to={menuItem.url(username)}
      >
        {menuItemContent}
      </NavigationItem>
    );
  };

  renderLikes = () => {
    const { current_user: { likes, user = {} } } = this.props;
    const { username } = user;
    const { likes: menuItem } = MENU_ITEMS;

    let menuItemContent = menuItem.title.normal;
    if (likes.length) {
      menuItemContent += `: ${likes.length} total`;
    }

    menuItemContent += `, ${undefined} last week`;

    return (
      <NavigationItem
        icon={menuItem.icon}
        theme="2.0"
        to={menuItem.url(username)}
      >
        {menuItemContent}
      </NavigationItem>
    );
  };

  renderFavorites = () => {
    const { current_user: { favourites, user = {} } } = this.props;
    const { username } = user;
    const { favorites: menuItem } = MENU_ITEMS;

    let menuItemContent = menuItem.title.normal;
    if (favourites.length) {
      menuItemContent += `: ${favourites.length} posts`;
    }

    menuItemContent += `, ${undefined} categories`;

    return (
      <NavigationItem
        icon={menuItem.icon}
        theme="2.0"
        to={menuItem.url(username)}
      >
        {menuItemContent}
      </NavigationItem>
    );
  };

  renderCollections = () => {
    const { current_user: { following_collections, user = {} } } = this.props;
    const { username } = user;
    const { collections: menuItem } = MENU_ITEMS;

    let menuItemContent = menuItem.title.normal;
    if (following_collections && following_collections.length) {
      menuItemContent += `: ${following_collections.length} posts`;
    }

    menuItemContent += `, ${undefined} curated`;

    return (
      <NavigationItem
        icon={menuItem.icon}
        theme="2.0"
        to={menuItem.url(username)}
      >
        {menuItemContent}
      </NavigationItem>
    );
  };

  render() {
    return (
      <Navigation>
        {this.renderNews()}
        {this.renderLikes()}
        {this.renderFavorites()}
        {this.renderCollections()}
      </Navigation>
    );
  }
}
