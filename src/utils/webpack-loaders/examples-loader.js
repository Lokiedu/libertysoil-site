import path from 'path';
import { processMarkdown } from '../../components/ui-kit/util/transform';

const srcPath = path.resolve(__dirname, '../../');

module.exports = function (source) {
  if (this.cacheable) {
    this.cacheable();
  }

  const exports = processMarkdown(source);

  return JSON.stringify({
    __context: path.relative(srcPath, this.context),
    __raw: source,
    exports
  });
};
