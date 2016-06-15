import { v4 as uuid4 } from 'uuid';


export default function createRequestLogger(options) {
  const logger = options.logger;
  const headerName = options.headerName || 'x-request-id';
  const level = options.level || 'info';
  const bodyLevel = options.bodyLevel || 'debug';

  const handler = async function (ctx, next) {
    const id = ctx.request.headers[headerName] || uuid4();
    const startOpts = { req: ctx.req };

    ctx.response.set(headerName, id);

    ctx.requestLogger = logger.child({
      type: 'request',
      id,
      serializers: logger.constructor.stdSerializers
    });

    ctx.requestLogger[level](startOpts, 'start request');

    if (ctx.request.body) {
      ctx.requestLogger[bodyLevel]({ body: ctx.request.body }, 'request body');
    }

    const time = process.hrtime();
    const responseSent = () => {
      const diff = process.hrtime(time);
      ctx.requestLogger[level]({ res: ctx.res, duration: diff[0] * 1e3 + diff[1] * 1e-6 }, 'end request');
    };

    ctx.res.once('finish', responseSent);
    ctx.res.once('close', responseSent);

    return next();
  };

  return handler;
}
