import { addScore, listScores } from '../controllers/score.controller.js';

export default async function api(fastify) {
  fastify.get('/scores', listScores);
  fastify.post('/scores', {
    schema: {
      body: {
        type: 'object',
        required: [ 'player', 'score' ],
        properties: {
          player: { type: 'string' },
          score:  { type: 'integer' }
        }
      }
    }
  }, addScore);
}