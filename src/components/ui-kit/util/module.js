import cloneDeep from 'lodash/cloneDeep';
import difference from 'lodash/difference';
import { dirname, join } from 'path-browserify';
import { tryRequire } from './require';

import transform from './transform';

function isFromSrc(path) {
  return !!path.match(/^\./);
}

async function loadSource(path) {
  if (process.env.NODE_ENV === 'production') {
    return await fetch(CONFIG.js.rootpath.concat(join('/src', path)));
  }

  return require(tryRequire('!!raw-loader!'.concat(path))); // ??? need context
}

export default function Module(_options) {
  let raw, out, compile;
  let path, fs, deps, listeners;
  let frozen, outdated;
  let exports, evaluate;

  const rebuild = () => {
    if (frozen) {
      outdated = 'rebuild';
      return;
    }

    if (compile) {
      if (typeof __raw !== 'string') { // isPromise
        return __raw.then(rebuild).catch((e) => { ??? });
      }

      // dont't `Object.assign(this, compile(this));`
      // order may make sense
      const { __deps, __out } = compile(raw, { context: this.__ctx });
      this.__deps = __deps.filter(isFromSrc);
      this.__out = __out;
    }
  };

  const reload = () => {
    if (frozen) {
      outdated = 'reload';
      return;
    }

    let code;
    if (typeof out === 'undefined') {
      code = raw;
    } else {
      code = out;
    }

    this.exports = evaluate(code);

    if (outdated) {
      outdated = null;
    }
  };

  const update = () => {
    if (frozen) {
      return;
    }

    switch (outdated) {
      case 'rebuild': {
        rebuild();
        break;
      }
      case 'reload': {
        reload();
        break;
      }
    }

    outdated = null;
  };

  {
    let opts = {};
    if (typeof _options === 'object') {
      // eslint-disable-next-line prefer-object-spread/prefer-object-spread
      opts = Object.assign({}, Module.defaultOptions, _options);
    } else {
      opts = Module.defaultOptions;
    }

    opts = cloneDeep(opts);

    raw = opts.__raw;
    out = opts.__out;
    path = opts.__path;
    deps = opts.__deps;
    fs = opts.__fs;
    evaluate = opts.__evaluate;
    compile = opts.__compile;
    listeners = opts.__listeners;
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
        rebuild();
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

        const ctx = this.__ctx;
        const removed = difference(deps, nextDeps);
        for (let i = 0, l = removed.length; i < l; ++i) {
          fs.getModule(join(ctx, removed[i])).removeListener('change', reload);
        }

        const added = difference(nextDeps, deps).filter(isFromSrc);
        for (let i = 0, l = added.length; i < l; ++i) {
          const modulePath = join(ctx, added[i]);
          let module = fs.getModule(modulePath);
          if (!module) {
            module = new Module({
              __raw: loadSource(modulePath),
              __path: modulePath,
              __compile: transform,
              __evaluate: eval
            });
            fs.set(modulePath, module);
          }

          module.addListener('change', reload);
        }

        deps = nextDeps;
      }
    },
    __outdated: {
      get: () => !!outdated
    },
    __path: {
      get: () => path,
      // set: () => {}
    },
    __ctx: {
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
        Module.broadcast({ type: 'change', target: this }, listeners);
      }
    },
    frozen: {
      get: () => frozen,
      set: (nextFrozen) => {
        if (nextFrozen === frozen) {
          return;
        }

        frozen = nextFrozen;
        update();
      }
    },
    addListener: {
      writable: false,
      configurable: false,
      value: (eventType, f) => {
        if (!listeners[eventType]) {
          listeners[eventType] = [];
        }

        listeners[eventType].push(f);
      }
    },
    removeListener: {
      writable: false,
      configurable: false,
      value: (eventType, f) => {
        const index = listeners[eventType].findIndex(l => l === f);
        if (index >= 0) {
          return listeners[eventType].splice(index, 1)[0];
        }

        return undefined;
      }
    },
    abort: {
      writable: false,
      configurable: false,
      value: () => {
        this.__deps = [];
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
  __outdated: false,
  __listeners: { '*': [], change: [] },
  __fs: null,
  /* __ctx: undefined, */
  __path: undefined,
  __compile: Module.compile,
  __evaluate: eval,
  params: {},
  frozen: false,
  exports: undefined
};

Module.from = (options) => {
  return new Module(cloneDeep(options));
};

Module.broadcast = (event, listeners) => {
  if (Array.isArray(listeners)) {
    Module.broadcastAll(event, listeners);
  } else {
    Module.broadcastAll(event, listeners[event.type]);
    Module.broadcastAll(event, listeners['*']);
  }
};

Module.broadcastAll = (event, listeners) => {
  if (!listeners || !listeners.length) {
    return;
  }

  for (let i = 0, l = listeners.length; i < l; ++i) {
    listeners[i](event);
  }
};
