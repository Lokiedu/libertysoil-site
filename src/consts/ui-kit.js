if (require.extensions) {
  require.extensions['.md'] = () => {};
}

export const CONFIG = {
  css: { rootpath: 'https://raw.githubusercontent.com/Lokiedu/libertysoil-site/feature/ui-kit/src/less/blocks/' },
  js: {
    rootpath: 'http://raw.githubusercontent.com/Lokiedu/libertysoil-site/feature/ui-kit/',
    require: (moduleName) => {
      switch (moduleName) {
        // startsWith instead of direct equality?
        case 'less': return require('less');
        case 'react': return require('react');
        case 'react-dom': return require('react-dom');
        default: return null;
      }
    }
  }
};

export const UNITS = [
  {
    name: 'Button',
    description: null,
    url_name: 'button',
    __path: 'components/button/README'
  }
];
