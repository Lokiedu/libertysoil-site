import path from 'path-browserify';

import ModuleStorage from './module-storage';
import { requireExternalModule, tryRequire } from './require';

export default function UIKit() {
  this.fs = new ModuleStorage();
  this.units = new ModuleStorage();

  this.require = (query, ctx) => {
    if (!query.startsWith('.')) {
      return requireExternalModule(query);
    }

    if (!ctx) {
      return tryRequire(query, this.fs);
    }

    return tryRequire('.'.concat(path.resolve(ctx, query)), this.fs);
  };
  this.spyProps = (p) => {
    console.log('spy props: ', p);
  };
}

export const uiKit = new UIKit();

export function initUIKit() {
  window.UIKit = uiKit;
}
