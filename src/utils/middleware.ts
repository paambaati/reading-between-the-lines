/**
 * Simple Koa Middleware.
 */

import { IRouterContext } from 'koa-tree-router';
import Logger from './logging';

// Initializers.
const logger = new Logger('rblt-middleware').logger;

/**
 * Request logging middleware.
 * Simply logs all incoming requests.
 * @param ctx Koa context.
 * @param next Koa next.
 */
export async function requestLoggingMiddleware(
  ctx: IRouterContext,
  next: () => Promise<any>
) {
  const request = ctx.toJSON().request;
  let url = request.url;
  logger.debug({
    msg: 'New API Request',
    method: request.method,
    url
  });
  await next();
}

/**
 * Error handling middleware.
 * @param ctx Koa context.
 * @param next Koa next.
 */
export async function errorHandlingMiddleware(
  ctx: IRouterContext,
  next: () => Promise<any>
) {
  try {
    await next();
  } catch (err) {
    ctx.body = {
      err: true,
      code: err['code']
    };
    ctx.status = err['statusCode'] || 500;
    ctx.body.msg = err.message;
    if (err.name === 'UnprocessableEntityError') {
      // Thrown by json-schema-validator.
      ctx.body.msg = 'Schema validation failed!';
      ctx.body.description = err.error_description;
    }
    logger.error({
      msg: 'Something went terribly wrong on the API server!',
      err,
      context: ctx
    });
    ctx.app.emit('error', err, ctx);
  }
}
