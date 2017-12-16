const fs = require('fs');
const addHook = require('asset-require-hook/lib/hook');
const assetRequireHook = require('asset-require-hook');
const babelRegisterHook = require("babel-register");

function rawLoader(resourcePath) {
  const content =  fs.readFileSync(resourcePath, 'utf-8');
  return content;
}

// attachHook(rawLoader, '.ejs');
addHook('.ejs', rawLoader);

assetRequireHook({
  extensions: ['.png', 'jpg', '.gif', '.svg'],
  name: 'assets/images/[name]-[hash].[ext]',
  publicPath: '/'
});

assetRequireHook({
  extensions: ['.ico'],
  name: '[name]-[hash].[ext]',
  publicPath: '/'
});

babelRegisterHook({
  ignore: /\/(public|node_modules)\//,
  plugins: [
    'react-hot-loader/babel'
  ]
});
