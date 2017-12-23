import mount from 'koa-mount';

export default function setupApiReloader(app, bookshelf, sphinx) {
  let middleware;
  return function handleChange(initial) {
    const { initApi } = require('../api/routing');
    const api = initApi(bookshelf, sphinx);

    if (initial) {
      middleware = mount('/api/v1', api);
      app.use(middleware);
    } else {
      const i = app.middleware.findIndex(m => m === middleware);
      if (i >= 0) {
        app.middleware[i] = middleware = mount('/api/v1', api);
      }
    }
  };
}
