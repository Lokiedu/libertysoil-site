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

/**
 * Matches the menu item against the path.
 */
function matchItem(item, path) {
  return (item.regexp && path.match(item.regexp) !== null) ||
          item.path === path;
}

/**
 * Recursive depth-first search on items of MenuTree.
 */
function find(currentPath, items) {
  for (const item of items) {
    if (matchItem(item, currentPath)) {
      return item;
    }

    if (item.children) {
      const result = find(currentPath, item.children);

      if (result) {
        return result;
      }
    }
  }

  return null;
}

export class MenuTree {
  /**
   * Menu item format:
   * `
   *   {
   *     name: 'Name', // Any property
   *     path: '/path', // String representing a path.
   *     regexp: /\/path/, // Optional regexp
   *     children: [] // Optional array of menu items
   *   }
   * `
   * When `regexp` is specified it will be used for matching instead of `path`.
   * @param {Object[]} items An array of menu items.
   */
  constructor(items) {
    this.items = Object.freeze(items);
  }

  /**
   * Finds the root menu item for the current path.
   * @param {String} currentPath A path without a query.
   */
  getCurrentRoot(currentPath) {
    // Match children first
    for (const item of this.items) {
      if (item.children) {
        const current = find(currentPath, item.children);

        if (current) {
          return item;
        }
      }
    }

    // then root items
    for (const item of this.items) {
      if (matchItem(item, currentPath)) {
        return item;
      }
    }

    return null;
  }

  /**
   * Finds the matching menu item for the current path.
   * @param {String} currentPath A path without a query.
   */
  getCurrent(currentPath) {
    return find(currentPath, this.items);
  }
}

/**
 * Menu for tool pages (/tools/*).
 */
export const toolsMenu = new MenuTree([
  {
    name: 'Account',
    path: '/tools/account',
    children: [
      {
        name: 'Your security',
        children: [
          { name: 'Password', path: '/tools/account/password' }
        ]
      }
    ]
  },
  {
    name: 'Tags',
    path: '/tools/tags',
    children: [
      { name: 'Schools', path: '/tools/schools', regexp: /\/tools\/schools/ }
    ]
  },
  {
    name: 'My',
    path: '/tools/my',
    children: [
      { name: 'Posts', path: '/tools/my/posts' }
    ]
  },
  {
    name: 'People',
    path: '/tools/people',
    children: [
      { name: 'Following', path: '/tools/people/following' }
    ]
  },
  {
    name: 'Conversations',
    path: '/tools/conversations'
  }
]);
