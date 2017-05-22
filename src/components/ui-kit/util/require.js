import path from 'path-browserify';

import type ModuleStorage from './module-storage';

function _require(filepath, fs?: ModuleStorage) {
  if (fs && fs.isDefined(filepath)) {
    return fs.get(filepath);
  }

  if (!_require.requireWithContext) {
    /*
      > require.context(directory, useSubdirectories = false, regExp = /^\.\//)

      It isn't possible to pass an instance of RegExp as variable.
      See https://webpack.github.io/docs/context.html#parser-evaluation

      regExp === RegExp(
        "^\.\/"
          + "("
            + "("
              + "(api\/client)|(utils\/"
                + "(browser|command|lang|loader|message|paragraphify|tags|urlGenerator)"
              + ")"
            + ")|"
            + "("
              + "(components|actions|consts|definitions|external|less|pages|(prop-types)|selectors|triggers)"
              + "\/.*"
            + ")|"
            + "([a-zA-Z0-9_-]+)" // root directory
          + ")"
        + "\.(js|jsx|less|css|json|md)$"
      );
    */

    _require.requireWithContext = require.context('../../..', true, /^\.\/(((api\/client)|(utils\/(browser|command|lang|loader|message|paragraphify|tags|urlGenerator)))|((components|actions|consts|definitions|external|less|pages|(prop-types)|selectors|triggers)\/.*)|([a-zA-Z]{1,}))\.(js|jsx|less|css|json|md)$/);
  }

  return _require.requireWithContext(filepath);
}

const extensions = ['.js', '.jsx', '.less', '.css', '.json', '.md'];

export function tryRequire(filepath, ...args) {
  let result, lastError;

  try {
    result = _require(filepath, ...args);
    return result;
  } catch (e) {
    lastError = e;
  }

  if (!path.extname(filepath)) {
    for (const ext of extensions) {
      try {
        result = _require(filepath.concat(ext), ...args);
        return result;
      } catch (e) {
        lastError = e;
      }
    }

    for (const ext of extensions) {
      try {
        result = _require(
          '.'.concat(path.resolve(filepath, 'index'.concat(ext))),
          ...args
        );
        return result;
      } catch (e) {
        lastError = e;
      }
    }
  }

  throw lastError;
}

export function requireExternalModule(moduleName) {
  switch (moduleName) {
    case 'react': return require('react');
    default: throw new Error(`Cannot find module '${moduleName}'`);
  }
}
