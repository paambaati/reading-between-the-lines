import Koa from 'koa';
import Router from 'koa-tree-router';
import supertest from 'supertest';
import test from 'tape';
import { errorHandlingMiddleware } from '../../src/utils/middleware';

/**
 * Common variables.
 */

const consoleError = console.error;

/**
 * Helper functions.
 */

function disableErrorConsole() {
  console.error = () => {};
}

function enableErrorConsole() {
  console.error = consoleError;
}

/**
 * Tests.
 */

test('✨ UTILS/middleware — Error handling middleware should return a 422 error for schema validation failure errors.', t => {
  t.plan(2);
  const errCode = 422;
  disableErrorConsole();
  // Set up Koa route mock.
  const app = new Koa();
  const router = new Router();
  app.use(errorHandlingMiddleware);
  router.get('/', async (ctx, next) => {
    return ctx.throw(errCode, 'invalid inputs', {
      error_description: 'something'
    });
  });
  app.use(router.routes());
  const server = app.listen();
  supertest(server)
    .get('/')
    .expect(errCode)
    .expect('Content-Type', /application\/json/)
    .end((err, res) => {
      enableErrorConsole();
      t.equals(err, null, 'Should still return a response.');
      t.deepEquals(
        res.body,
        {
          err: true,
          msg: 'Schema validation failed!',
          description: 'something'
        },
        'Response should include error message & description.'
      );
      server.close();
      t.end();
    });
});

test('✨ UTILS/middleware — Error handling middleware should return a nicely formatted response for all unexpected errors.', t => {
  t.plan(2);
  const errMessage = 'oops';
  const errCode = 'ERR_SOME_CODE';
  disableErrorConsole();
  // Set up Koa route mock.
  const app = new Koa();
  const router = new Router();
  app.use(errorHandlingMiddleware);
  router.get('/', async (ctx, next) => {
    const err = new Error(errMessage);
    err['code'] = errCode;
    throw err;
  });
  app.use(router.routes());
  const server = app.listen();
  supertest(server)
    .get('/')
    .expect(500)
    .expect('Content-Type', /application\/json/)
    .end((err, res) => {
      enableErrorConsole();
      t.equals(err, null, 'Should still return a response.');
      t.deepEquals(
        res.body,
        { err: true, code: errCode, msg: errMessage },
        'Response should include error message & code.'
      );
      server.close();
      t.end();
    });
});
