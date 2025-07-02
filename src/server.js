import Fastify from 'fastify';
import path from 'path';
import { fileURLToPath } from 'url';

import dbPlugin       from './config/db.js';
import apiRoutes      from './routes/api.js';
import fastifyStatic  from '@fastify/static';
import routes         from './routes/routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const fastify = Fastify({ logger: true });

fastify.register(dbPlugin);

fastify.register(apiRoutes, { prefix: '/api' });

fastify.register(fastifyStatic, {
  root: path.join(__dirname, 'views'),
  prefix: '/',
});

fastify.register(routes);

const start = async () => {
  try {
    await fastify.listen({ port: 3000 });
    console.log('Server listening on http://localhost:3000');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();