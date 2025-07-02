export async function listScores(request, reply) {
  const stmt = request.server.db.prepare(
    'SELECT player, score, played FROM scores ORDER BY score DESC LIMIT 3'
  );
  const top3 = stmt.all();
  return reply.send({ top3 });
}

export async function addScore(request, reply) {
  const { player, score } = request.body;
  const stmt = request.server.db.prepare(
    'INSERT INTO scores (player, score) VALUES (?, ?)'
  );
  const info = stmt.run(player, score);
  return reply.code(201).send({ id: info.lastInsertRowid });
}
