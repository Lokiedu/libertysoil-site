import { JSDOM, VirtualConsole } from 'jsdom';

const virtualConsole = new VirtualConsole();
virtualConsole.on("log", function (message) {
  console.log("console.log called ->", message);  // eslint-disable-line no-console
});

const { window } = new JSDOM(
  '<!doctype html><html><body></body></html>',
  { virtualConsole }
);

function copyProps(src, target) {
  const props = Object.getOwnPropertyNames(src)
    .filter(prop => typeof target[prop] === 'undefined')
    .map(prop => Object.getOwnPropertyDescriptor(src, prop));
  Object.defineProperties(target, props);
}

global.window = window;
global.document = window.document;
global.navigator = {
  platform: '',
  userAgent: 'node.js'
};
// To fix leaflet
global.HTMLVideoElement = window.HTMLVideoElement;
copyProps(window, global);
