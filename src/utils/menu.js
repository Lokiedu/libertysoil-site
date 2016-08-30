/*
 This file is a part of libertysoil.org website
 Copyright (C) 2015  Loki Education (Social Enterprise)

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
export class MenuTree {
  /**
   * Menu item format:
   *  {
   *    name: 'Name',
   *    path: '/path',
   *    children: [] // optional array of menu items
   *  }
   * @param {Object[]} items An array of menu items.
   */
  constructor(items) {
    this.items = Object.freeze(items);
  }

  getCurrentRoot(currentPath) {
    for (const item of this.items) {
      const current = this.find(currentPath, item.children);

      if (current) {
        return item;
      }
    }

    return null;
  }

  getCurrent(currentPath) {
    return this.find(currentPath, this.items);
  }

  find(currentPath, items) {
    for (const item of items) {
      if (item.path === currentPath) {
        return item;
      }

      if (item.children) {
        const result = this.find(currentPath, item.children);

        if (result) {
          return result;
        }
      }
    }

    return null;
  }
}

export const toolsMenu = new MenuTree([
  {
    name: 'Account',
    path: '/tools/account',
    children: [
      {
        name: 'Welcome',
        path: '/tools/account'
      },
      {
        name: 'Your security',
        path: '/tools/account/security',
        children: [
          { name: 'Password change', path: '/tools/account/password-change' }
        ]
      }
    ]
  },
  {
    name: 'Tags',
    path: '/tools/tags',
    children: [
      { name: 'Schools', path: '/tools/schools' }
    ]
  }
]);
