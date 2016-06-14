import app from './server';

global.Promise = require('bluebird')
global.Promise.config({
  warnings: false,
  longStackTraces: true,
  cancellation: true
});

const PORT = 8000;

app.listen(PORT, function (err) {
  if (err) {
    console.error(err);  // eslint-disable-line no-console
    process.exit(1);
  }

  process.stdout.write(`Listening at http://0.0.0.0:${PORT}\n`);
});

export default app;
