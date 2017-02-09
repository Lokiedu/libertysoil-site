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
export const MENU_ITEMS = [
  {
    className: 'mobile-menu__item--to_home',
    icon: {
      icon: 'public'
    },
    title: 'home',
    url: () => '/'
  },
  {
    className: 'mobile-menu__item--to_schools',
    icon: {
      icon: 'school'
    },
    title: 'schools',
    url: () => '/s'
  },
  {
    className: 'mobile-menu__item--to_locations',
    icon: {
      icon: 'location-on'
    },
    title: 'locations',
    url: () => '/geo'
  },
  {
    className: 'mobile-menu__item--to_people',
    icon: {
      icon: 'at'
    },
    title: 'people',
    url: () => '/tools/people'
  }
];
