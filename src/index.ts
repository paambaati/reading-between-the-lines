/**
 * reading-between-the-lines API Server.
 */

import config from 'config';
import { Server } from 'http';
import Koa from 'koa';
import Router from 'koa-tree-router';
import BodyParser from 'koa-json-body';
import { middleware as schemaValidator } from 'koa-json-schema';
import Readings from './core/readings';
import { pingRoute } from './routes/generic';
import { readingsSelectRoute, readingsInsertRoute } from './routes/readings';
import Logger from './utils/logging';
import {
  requestLoggingMiddleware,
  errorHandlingMiddleware
} from './utils/middleware';
import Database from './utils/database';
import JsonReader from './utils/json';

// Initializers.
const logger = new Logger('rbtl-server').logger;
const db = new Database(
  config.get('database.file'),
  config.get('database.migrations')
);

// Load sample data into the DB.
new JsonReader('./data/sampleData.json').read().then(seedData => {
  for (const reading of seedData.electricity) {
    Readings.put(reading);
  }
  logger.info({
    msg: 'Seed data inserted!',
    rowsInserted: seedData.electricity.length
  });
});

// Koa setup.
const app = new Koa();
const router = new Router({
  // 405 handler.
  onMethodNotAllowed(ctx) {
    ctx.set('Content-Type', 'application/json; charset=utf-8');
    ctx.body = {
      err: true,
      message: 'Method Not Allowed'
    };
  }
});

/**
 * Middleware.
 */
app.use(errorHandlingMiddleware);
app.use(BodyParser());
app.use(requestLoggingMiddleware);

/**
 * API Routes.
 */

// Generic routes.
router.get('/', pingRoute);

// Database routes.
router.get('/readings', readingsSelectRoute);
router.put(
  '/readings',
  schemaValidator(config.get('schema.insertReadings')),
  readingsInsertRoute
);

// Attach routes as middleware.
app.use(router.routes());

// Log unhandled promise rejections.
/* istanbul ignore next */
process.on('unhandledRejection', (err, promise) => {
  logger.warn({
    msg:
      'Unhandled promise rejection detected! Fix this soon as future Node.js versions would throw this as a non-zero exit error!',
    err,
    promise
  });
});

/**
 * Server spin-up.
 */

// Start server.
/* istanbul ignore next */
const port = config.get('api.port');
const server: Server = app.listen(port);
logger.info({
  msg: 'reading-between-the-lines API Server now listening...',
  port
});

/**
 * Exports.
 */

export { router, server };
