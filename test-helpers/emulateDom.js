
if (typeof document === 'undefined') {
  const virtualConsole = require('jsdom').createVirtualConsole();
  virtualConsole.on("log", function (message) {
    console.log("console.log called ->", message);  // eslint-disable-line no-console
  });

  const jsdom = require('jsdom').jsdom;

  global.document = jsdom(undefined, { virtualConsole });
  global.window = global.document.defaultView;

  for (const key in global.window) {
    if (!global[key]) {
      global[key] = global.window[key];
    }
  }
}
