const path = require('path');

const watcher = require('chokidar')
  .watch([
    path.join(__dirname, '../../src/api'),
    path.join(__dirname, '../../src/utils')
  ]);

watcher.on('ready', () => {
  watcher.on('all', () => {
    // eslint-disable-next-line no-console
    console.log('Clearing server module cache from server');
    Object.keys(require.cache).forEach(id => {
      if (/[/\\]src[/\\](api|utils)/.test(id)) {
        delete require.cache[id];
      }
    });
  });
});

/* Optional: "hot-reloading" of client related modules on the server

  const compiler = require('webpack')(require('../../res/webpack/client.js'));
  compiler.plugin('done', () => {
    // Need to separate client and server code to prevent unnecessary reloads
  });

*/
