import { transform } from 'babel-core';
import babelPresetES2015 from 'babel-preset-es2015';
import babelPresetReact from 'babel-preset-react';
import babelPresetStage from 'babel-preset-stage-1';
import babelPresetBabili from 'babel-preset-babili';

export default function transformJSX(code, options = {}) {
  const presets = [babelPresetReact, babelPresetStage];
  if (!options.skipES2015Transform) {
    presets.push(babelPresetES2015);
  }
  let compiled = transform(code, { presets, comments: false });
  const __deps = compiled.metadata.modules.imports.reduce(
    (acc, i) => (acc.push(i.source), acc),
    []
  );

  compiled = transform(
    injectContextRequire(
      injectModuleFunction(
        injectCreateElementProxy(compiled.code),
        options.context || ''
      ),
    ),
    { presets: [babelPresetBabili] }
  );
  return {
    __out: compiled.code,
    __deps
  };
}

export function injectCreateElementProxy(compiledCode) {
  let callee;
  const nextCode = compiledCode.replace(/[a-zA-Z0-9_]+\.default\.createElement/g, s => {
    callee = s;
    return '_createElement';
  });

  if (!callee) {
    return compiledCode;
  }

  return nextCode.replace(
    '\'use strict\';',
    'function _createElement() {\
      global.spyProps(arguments[1]);\
      return '.concat(callee).concat('.apply(undefined, arguments);\
    }')
  );
}

export function injectModuleFunction(compiledCode, context) {
  return '(function(global, context, exports){'
    .concat(compiledCode)
    .concat(`return exports;})(window.UIKit, '${context}', {})`);
}

export function injectContextRequire(compiledCode) {
  return compiledCode.replace(/require\((.+)\)/g, 'global.require($1,context)');
}

export function processMarkdown(source) {
  const examples = [];
  const snippetToRender = /```(?:(render|(?:(javascript|js) \(render\))))\n([\s\S]+)\n```/gm;
  const next = source.replace(snippetToRender, code => (
    examples.push({ code: code.replace(/^.*\n/, '').replace(/\n```$/, '') }),
    '```KIT_EXAMPLE\n```'
  ));

  return { examples, md: next };
}

export function parseMarkdown(md) {
  const examples = [];
  const snippetToRender = /```(?:(render|(?:(javascript|js) \(render\))))\n(.*)\n```/gm;
  const next = md.replace(snippetToRender, code =>
    '```KIT_EXAMPLE '
      .concat(examples.push(code.replace(/^.*\n/, '').replace(/\n```$/, '')) - 1)
      .concat('```')
  );

  return {
    examples,
    md: next
  };
}

// export function defineExports(compiledCode) {
//   const i = compiledCode.search(/Obj.*\(exports/);
//   return compiledCode
//     .slice(0, i)
//     .concat('var exports = {};')
//     .concat(compiledCode.slice(i))
//     .concat('exports;');
// }

// export function declareDeps(compiledCode) {
//   const deps = compiledCode
//     .match(/require\([\'\"]([a-zA-Z\/\._-]{1,})[\'\"]\)/g)
//     .map(x => /[\'|\"](.*)[\'\"]/.exec(x)[1]);
//   return compiledCode.replace(
//     'exports = {}',
//     'exports = {__deps:'.concat(JSON.stringify(deps)).concat('}')
//   );
// }
