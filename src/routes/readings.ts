import { IRouterContext } from 'koa-tree-router';
import Readings, { Reading } from '../core/readings';

/**
 * Meter readings routes.
 */

/**
 * Readings `SELECT` route.
 * Responds with the meter readings interpolated for end-of-month readings and usage.
 *
 * @export
 * @param {IRouterContext} Koa context.
 * @param { () => Promise<any>} Koa next.
 */
export async function readingsSelectRoute(
  ctx: IRouterContext,
  next: () => Promise<any>
) {
  const results = Readings.get();
  ctx.body = results;
  return await next();
}

/**
 * Readings `INSERT` route.
 * Responds with the results of an INSERT query on the database.
 *
 * @export
 * @param {IRouterContext} Koa context.
 * @param { () => Promise<any>} Koa next.
 */
export async function readingsInsertRoute(
  ctx: IRouterContext,
  next: () => Promise<any>
) {
  const payload: Reading = ctx.request['body'];
  const inserted = Readings.put(payload);
  ctx.body = {
    operation: 'INSERT',
    err: false,
    inserted
  };
  return await next();
}
