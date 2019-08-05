import Koa from 'koa';
import Router from 'koa-tree-router';
import BodyParser from 'koa-json-body';
import supertest from 'supertest';
import test from 'tape';
import {
  readingsSelectRoute,
  readingsInsertRoute
} from '../../src/routes/readings';

/**
 * Tests.
 */

test("✨ ROUTES/readings — API server should respond to 'GET /readings' endpoint with readings.", t => {
  t.plan(3);
  const endpoint = '/readings';
  const app = new Koa();
  const router = new Router();
  router.get(endpoint, readingsSelectRoute);
  app.use(router.routes());
  const server = app.listen();
  supertest(server)
    .get(endpoint)
    .expect('Content-Type', /application\/json/)
    .expect(200)
    .end((err, res) => {
      t.equals(err, null, 'Should not return any errors.');
      const response = res.body;
      t.true(Array.isArray(response), 'response should be an array.');
      // This assumes the DB has already been seeded with sample data.
      t.deepEquals(
        Object.keys(response[0]).sort(),
        ['cumulative', 'readingDate', 'unit', 'usage'].sort(),
        'data should have shape of ReadingWithUsage object.'
      );
      server.close();
      t.end();
    });
});

test("✨ ROUTES/readings — API server should respond to 'PUT /readings' endpoint with added reading.", t => {
  t.plan(2);
  const payload = {
    cumulative: 9000,
    readingDate: '2019-08-05T00:00:00.000Z',
    unit: 'kWh'
  };
  const endpoint = '/readings';
  const app = new Koa();
  const router = new Router();
  router.put(endpoint, readingsInsertRoute);
  app.use(BodyParser()); // So we can parse JSON in request body.
  app.use(router.routes());
  const server = app.listen();
  supertest(server)
    .put(endpoint)
    .type('json')
    .send(payload)
    .expect('Content-Type', /application\/json/)
    .expect(200)
    .end((err, res) => {
      t.equals(err, null, 'Should not return any errors.');
      const response = res.body;
      t.deepEquals(response, {
        operation: 'INSERT',
        err: false,
        inserted: payload
      });
      server.close();
      t.end();
    });
});
