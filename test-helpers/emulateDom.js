import { JSDOM, VirtualConsole } from 'jsdom';

const virtualConsole = new VirtualConsole();
virtualConsole.on("log", function (message) {
  console.log("console.log called ->", message);  // eslint-disable-line no-console
});
const { window } = new JSDOM('<!doctype html><html><body></body></html>', { virtualConsole });

global.window = window;
global.document = window.document;

for (const key in global.window) {
  if (!global[key]) {
    global[key] = global.window[key];
  }
}

// To fix leaflet
global.HTMLVideoElement = window.HTMLVideoElement;
