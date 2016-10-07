/* eslint-env node, mocha */
import { expect } from '../../../test-helpers/expect-unit';
import { MenuTree } from '../../../src/utils/menu';

const menu = new MenuTree([
  {
    name: 'Root1',
    path: '/root1',
    children: [
      {
        name: 'Root1 > 1',
        path: '/root1/1'
      },
      {
        name: 'Root1 > n',
        regexp: /\/root1\/\d+/
      }
    ]
  },
  {
    name: 'Root2',
    path: '/root2'
  }
]);

describe('MenuItem', () => {
  describe('getCurrentRoot', () => {
    it('returns root item when path is found', () => {
      expect(menu.getCurrentRoot('/root1/1'), 'to satisfy', { name: 'Root1' });
      expect(menu.getCurrentRoot('/root1/234'), 'to satisfy', { name: 'Root1' });
    });

    it('returns null when path is not found', () => {
      expect(menu.getCurrentRoot('/root1/out-of-regexp'), 'to be null');
    });

    it('works on root items', () => {
      expect(menu.getCurrentRoot('/root2'), 'to satisfy', { name: 'Root2' });
    });
  });

  describe('getCurrent', () => {
    it('returns menu item when path is found', () => {
      expect(menu.getCurrent('/root1/1'), 'to satisfy', { name: 'Root1 > 1' });
      expect(menu.getCurrent('/root1/234'), 'to satisfy', { name: 'Root1 > n' });
    });

    it('returns null when path is not found', () => {
      expect(menu.getCurrent('/root1/out-of-regexp'), 'to be null');
    });

    it('works on root items', () => {
      expect(menu.getCurrent('/root2'), 'to satisfy', { name: 'Root2' });
    });
  });
});
