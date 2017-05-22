import _fetch from 'isomorphic-fetch';

export function fetch(url) {
  return _fetch(url).then(responseToText);
}

export function responseToText(res) {
  if (res.status >= 400) {
    throw new Error("Bad server response");
  }
  return res.text();
}

export const getUnit = (url_name) => {
  return window.UIKit.units[url_name];
};

export function transformLess() {
  throw new Error('Missing implementation');
}

// export function Module(mod = {
//   exports: {},
//   loaded: true,
//   onload: [],
//   path: null,
//   __esModule: true,
//   __raw: null,
//   __out: null,
// }) {
//   Object.assign(this, mod);
// }

// Module.load = async (path, opts) => {
//   const options = Object.assign({}, Module.load.defaultOptions, opts);
//   const params = { __raw: await fetch(options.context.path(path)) };
//   if (options.compile) {

//   }

//   return new Module(params);
// };

// Module.load.defaultOptions = (() => ({
//   compile: false,
//   context: 'http://raw.githubusercontent.com/Lokiedu/libertysoil-site/feature/ui-kit/src/',
//   kit: typeof window !== 'undefined' ? window.UIKit : {}
// }))();
