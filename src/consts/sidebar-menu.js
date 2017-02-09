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
export const MENU_ITEMS = {
  news: {
    className: 'navigation-item--color_blue menu__news',
    icon: {
      icon: 'public'
    },
    title: 'news',
    url: () => '/'
  },
  likes: {
    className: 'navigation-item--color_red menu__likes',
    icon: {
      icon: 'favorite'
    },
    title: 'likes',
    url: (username) => `/user/${username}/likes`
  },
  favourites: {
    className: 'navigation-item--color_green menu__favs',
    icon: {
      icon: 'star'
    },
    title: 'favs',
    url: (username) => `/user/${username}/favorites`
  },
  collections: {
    className: 'navigation-item--color_blue navigation-item--disabled menu__collect',
    disabled: true,
    icon: {
      icon: 'layers'
    },
    html: {
      title: 'Coming soon!'
    },
    title: 'collect',
    url: () => '/collections'
  }
};
