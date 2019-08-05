import { IRouterContext } from 'koa-tree-router';

/**
 * Generic routes.
 */

/**
 * '/' route.
 * Responds with a hello world response.
 *
 * @export
 * @param {IRouterContext} Koa context.
 * @param { () => Promise<any>} Koa next.
 */
export async function pingRoute(ctx: IRouterContext, next: () => Promise<any>) {
  ctx.body = {
    hello: 'world'
  };
  return await next();
}
