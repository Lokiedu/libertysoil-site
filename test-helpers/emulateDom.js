
if (typeof document === 'undefined') {

  let virtualConsole = require('jsdom').createVirtualConsole();
  virtualConsole.on("log", function (message) {
    console.log("console.log called ->", message);
  });

  const jsdom = require('jsdom').jsdom;

  global.document = jsdom(undefined, {virtualConsole: virtualConsole});
  global.window = global.document.defaultView;

  for (let key in global.window) {
    if (!global[key]) {
      global[key] = global.window[key];
    }
  }

}
