import cloneDeep from 'lodash/cloneDeep';
import difference from 'lodash/difference';
import { dirname } from 'path-browserify';

import transform from './transform';

export default function Module(_options) {
  let raw, out, compile;
  let path, fs, deps = [];
  let exports, evaluate;
  const listeners = [];

  const rebuild = () => {
    if (compile) {
      // dont't `Object.assign(this, compile(this));`
      // order may make sense
      const { __deps, __out } = compile(this);
      this.__deps = __deps;
      this.__out = __out;
    }
  };

  const reload = () => {
    this.exports = evaluate(out);
  };

  {
    let opts = {};
    if (typeof _options === 'object') {
      // eslint-disable-next-line prefer-object-spread/prefer-object-spread
      opts = Object.assign({}, _options, cloneDeep(Module.defaultOptions));
    } else {
      opts = Module.defaultOptions;
    }

    raw = opts.__raw;
    out = opts.__out;
    path = opts.__path;
    deps = opts.__deps;
    fs = opts.__fs;
    evaluate = opts.__evaluate;
    compile = opts.__compile;
    exports = opts.exports;
  }

  Object.defineProperties(this, {
    __raw: {
      get: () => raw,
      set: (nextRaw) => {
        if (nextRaw === raw) {
          return;
        }

        raw = nextRaw;
        rebuild(); // TODO: implement quiet updates
      }
    },
    __out: {
      get: () => out,
      set: (nextOut) => {
        if (nextOut === out) {
          return;
        }

        out = nextOut;
        reload();
      }
    },
    __deps: {
      get: () => deps,
      set: (nextDeps) => {
        if (nextDeps === deps) {
          return;
        }

        const removed = difference(deps, nextDeps);
        for (let i = 0, l = removed.length; i < l; ++i) {
          fs.getModule(removed[i]).removeListener(reload);
        }

        const added = difference(nextDeps, deps);
        for (let i = 0, l = added.length; i < l; ++i) {
          fs.getModule(added[i]).addListener(reload);
        }

        deps = nextDeps;
      }
    },
    __path: {
      writable: false,
      get: () => path,
      // set: () => {}
    },
    __ctx: {
      writable: false,
      get: () => dirname(path),
      // set: (nextCtx) => {
      //   path = dirname(nextCtx);
      //   reload(this);
      // }
    },
    __fs: {
      get: () => fs,
      set: (nextFS) => {
        fs = nextFS;
        reload();
      }
    },
    exports: {
      enumerable: true,
      get: () => exports,
      set: (nextExports) => {
        if (nextExports === exports) {
          return;
        }

        exports = nextExports;
        Module.broadcast('', listeners);
      }
    },
    addListener: {
      writable: false,
      configurable: false,
      value: (f) => {
        listeners.push(f);
      }
    },
    removeListener: {
      writable: false,
      configurable: false,
      value: (f) => {
        const index = listeners.findIndex(l => l === f);
        if (index >= 0) {
          return listeners.splice(index, 1)[0];
        }

        return undefined;
      }
    }
  });

  rebuild();
}

Module.compile = (m) =>
  transform(
    m.__raw,
    {
      context: m.__ctx,
      skipES2015Transform: false
    }
  );

Module.defaultOptions = {
  __raw: null,
  __out: undefined,
  __deps: [],
  __fs: null,
  __ctx: undefined,
  __compile: Module.compile,
  __evaluate: eval,
  exports: undefined
};

Module.from = (options) => {
  return new Module(cloneDeep(options));
};

Module.broadcast = (event, listeners) => {
  for (let i = 0, l = listeners.length; i < l; ++i) {
    listeners[i](event);
  }
};
