import cloneDeep from 'lodash/cloneDeep';
import pick from 'lodash/pick';
import { join } from 'path-browserify';

import { CONFIG } from '../../../consts/ui-kit';
import { fetch } from '../playground/util';
import Module from './module';
import { default as processJSX, processMarkdown } from './transform';

async function loadMarkdown(path) {
  let params;
  if (process.env.NODE_ENV === 'production') {
    params = {};
    params.__raw = await fetch(CONFIG.js.rootpath.concat(join('/src', path)));
    params.exports = processMarkdown(params.__raw);
  } else {
    params = require(`../../../${path}.md`);
  }

  return params;
}

/**
 * @constructor {Unit} Unit module
 * @param {Object} _options Options to create Unit with
 */
export default function Unit(_options) {
  let examples_count;
  let fs, path, deps;
  let frozen, outdated;
  let listeners;

  const reload = (m) => {
    if (frozen) {
      outdated = 'reload';
      return false;
    }

    const { exports: { examples } } = m;
    const nextExamples = examples.length;
    if (nextExamples >= examples_count) {
      for (let i = 0; i < examples_count; ++i) {
        fs.get(`${path}#${i}`).__raw = examples[i];
      }
      if (nextExamples > examples_count) {
        for (let examplePath, i = examples_count; i < nextExamples; ++i) {
          examplePath = `${path}#${i}`;
          fs.set(
            examplePath,
            new Module({
              __fs: fs,
              __listeners: { change: [path] },
              __path: examplePath,
              __raw: examples[i],
              __compile: processJSX,
              __evaluate: eval
            })
          );
        }
      }
    } else {
      for (let i = 0; i < nextExamples; ++i) {
        fs.get(`${path}#${i}`).__raw = examples[i];
      }
      for (let examplePath, example, i = nextExamples; i < examples_count; ++i) {
        examplePath = `${path}#${i}`;
        example = fs.get(examplePath);
        example.abort();
        fs.delete(examplePath);
      }
    }

    examples_count = nextExamples;
    outdated = null;
    return true;
  };

  const update = () => {
    if (frozen) {
      return false;
    }

    switch (outdated) {
      case 'reload': {
        // only markdown-related module may trigger Unit to reload
        const mdModule = fs.get(path);
        reload(mdModule);
        break;
      }
    }

    outdated = null;
    return true;
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
    deps = opts.__deps;
    path = opts.__path;
    fs = opts.__fs;
    listeners = opts.__listeners;
    frozen = opts.frozen;

    Object.assign(this, pick(opts, ['name', 'description', 'url_name']));
  }

  Object.defineProperties(this, {
    examples_count: {
      enumerable: true,
      get: () => examples_count
    },
    frozen: {
      get: () => frozen,
      set: (nextFrozen) => {
        if (nextFrozen === frozen) {
          return;
        }

        frozen = nextFrozen;
        const success = update();
        if (success) {
          Module.broadcast({ type: 'change', target: this }, listeners);
        }
      }
    },
    __outdated: {
      get: () => !!outdated
    },
    __fs: {
      get: () => fs,
      set: (nextFS) => {
        fs = nextFS;

        const success = reload();
        if (success) {
          Module.broadcast({ type: 'change', target: this }, listeners);
        }
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
    }
  });

  if (path) {
    const mdModule = fs.get(path);
    if (!mdModule) {
      throw new Error(`Unit#${this.url_name}: module '${path}' not found.`);
    }

    mdModule.addListener('change', reload);
    deps.push(path);

    reload(mdModule);
    Module.broadcast({ type: 'load', target: this }, listeners);
  }
}

Unit.defaultOptions = {
  __deps: [],
  __path: null,
  __fs: null,
  __listeners: { '*': [], load: [], change: [] },
  frozen: false,
  examples_count: undefined,
  description: null,
  name: null,
  url_name: null
};

Unit.from = async (_options/*, load*/) => {
  // eslint-disable-next-line prefer-object-spread/prefer-object-spread
  const options = Object.assign({}, Unit.defaultOptions, _options);
  const { __path: path, __fs: fs } = options;

  let mdModule = fs.get(path);
  if (!mdModule) {
    mdModule = await loadMarkdown(path);
    fs.set(
      path,
      Module.from({
        ...mdModule,
        __fs: fs,
        __path: path,
        __compile: null,
        __evaluate: processMarkdown
      })
    );
  }

  for (
    let
      exampleCode, examplePath, exampleModule,
      examples = mdModule.exports.examples, l = examples.length, i = 0;
    i < l;
    ++i
  ) {
    examplePath = path.concat('#').concat(i);
    exampleModule = fs.get(examplePath);
    exampleCode = examples[i];

    if (!exampleModule) {
      fs.set(
        examplePath,
        new Module({
          __raw: exampleCode,
          __path: examplePath,
          __fs: fs,
          __compile: processJSX,
          __evaluate: eval
        })
      );
    } else {
      exampleModule.__raw = exampleCode;
    }
  }

  return new Unit(options);
};

// Unit.from = async (path) => {
//   const options = Object.assign({}, Unit.load.defaultOptions, opts);

//   let params = {};
//   if (process.env.NODE_ENV === 'production') {
//     params.__raw = await fetch(options.context.path(path));
//     params.exports = processMarkdown(params.__raw);
//   } else {
//     params = require(`../../../${path}.md`);
//   }

//   if (options.compile) {
//     const { exports: e } = params;
//     e.md = e.md.split('```KIT_EXAMPLE\n```');
//     for (
//       let i = 0, j = 1, l = e.md.length, k = e.examples.length;
//       i < l && i < k;
//       ++i, j += 2
//     ) {
//       e.md.splice(j, 0, '```KIT\n'.concat(e.examples[i].code));
//     }
//   }
// };

// export function Unit(_options) {
//   Object.assign(this, Unit.defaultOptions, _options);

//   this.getExample = (index, fs) => (
//     fs.getModule(`${this.path}_${index}`)
//   );

//   this.load = async (fs: ModuleStorage, units: ModuleStorage) => {
//     const unitModule = await Unit.load(this.path, { compile: true });
//     this.examples_count = unitModule.exports.examples.length;
//     this.loaded = true;

//     if (fs) {
//       fs.set(this.path, unitModule);
//     }

//     if (units) {
//       units.set(this.url_name, this);
//     }

//     return unitModule;
//   };
// }

// Unit.defaultOptions = {
//   description: null,
//   examples_count: undefined,
//   loaded: false,
//   name: null,
//   path: null,
//   url_name: null
// };

// Unit.load = async (path, opts) => {
//   // eslint-disable-next-line prefer-object-spread/prefer-object-spread
//   const options = Object.assign({}, Unit.load.defaultOptions, opts);

//   let params = {};
//   if (process.env.NODE_ENV === 'production') {
//     params.__raw = await fetch(options.context.path(path));
//     params.exports = processMarkdown(params.__raw);
//   } else {
//     params = require(`../../../${path}.md`);
//   }

//   if (options.compile) {
//     const { exports: e } = params;
//     e.md = e.md.split('```KIT_EXAMPLE\n```');
//     for (
//       let i = 0, j = 1, l = e.md.length, k = e.examples.length;
//       i < l && i < k;
//       ++i, j += 2
//     ) {
//       e.md.splice(j, 0, '```KIT\n'.concat(e.examples[i].code));
//     }
//   }

//   return new Module(params);
// };

// Unit.load.defaultOptions = (() => ({
//   compile: false,
//   context: 'http://raw.githubusercontent.com/Lokiedu/libertysoil-site/feature/ui-kit/src/',
//   kit: typeof window !== 'undefined' ? window.UIKit : {}
// }))();

/*

  Unit -> markdown -> examples + md
  examples -> source code -> Module

  UnitComponent <- md + examples

  Module 'a' -> __deps = ['b'];

  Module 'b' -> __deps = [];

  unit.recompile
  hot id ?

  Module {
    __deps = [],
    __raw = '',
    __out = '',
    exports = {}
  }
*/
