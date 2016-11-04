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
    className: 'navigation-item--color_blue',
    title: {
      min: 'News',
      normal: 'News Feed'
    },
    icon: {
      icon: 'public'
    },
    url: () => '/'
  },
  likes: {
    className: 'navigation-item--color_red',
    title: {
      min: 'Likes',
      normal: 'My Likes'
    },
    icon: {
      icon: 'favorite'
    },
    url: (username) => `/user/${username}/likes`
  },
  favorites: {
    className: 'navigation-item--color_green',
    title: {
      min: 'Favs',
      normal: 'My Favorites'
    },
    icon: {
      icon: 'star'
    },
    url: (username) => `/user/${username}/favorites`
  },
  collections: {
    className: 'navigation-item--color_blue navigation-item--disabled',
    disabled: true,
    title: {
      min: 'Collect.',
      normal: 'Collections'
    },
    icon: {
      icon: 'layers'
    },
    html: {
      title: 'Coming soon!'
    },
    url: () => '/collections'
  }
};
