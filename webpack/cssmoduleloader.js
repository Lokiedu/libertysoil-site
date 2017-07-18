import path from 'path';

import loaderUtils from 'loader-utils';


export default function myCssModuleLoader(content) {
  const config = loaderUtils.getOptions(this);

  const imports = config.files.map(((el) => {
    const request = path.relative(this.resource, el).replace("../", "");
    return `@import '${request}';${String.fromCharCode(13)}`;
  }));

  return `${imports.join('')}${content}`;
}
