import { addUser, addScore, listScores } from '../controllers/score.controller.js';

export default async function api(fastify) {
  fastify.get('/scores', listScores);

  fastify.post('/scores', {
    schema: {
      body: {
        type: 'object',
        required: [ 'username', 'score' ],
        properties: {
          username: { type: 'string' },
          score:  { type: 'integer' }
        }
      }
    }
  }, addScore);

  fastify.post('/user', {
    schema: {
      body: {
        type: 'object',
        required: [ 'name', 'username', 'email'],
        properties: {
          name: { type: 'string' },
          username: { type: 'string' },
          email: { type: 'string' }
        }
      }
    }
  }, addUser);
}