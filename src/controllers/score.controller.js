export async function listScores(request, reply) {
  const stmt = request.server.db.prepare(`
    SELECT
      s.id,
      u.username,
      u.name,
      s.score,
      s.played
    FROM scores s
    JOIN users u ON u.id = s.user_id
    ORDER BY s.score DESC
    LIMIT 5
  `);
  const top5 = stmt.all();
  return reply.send({ top5 });
}

export async function addUser(request, reply) {
  const { name, username, email } = request.body;

  let stmt = request.server.db.prepare(
    'SELECT id FROM users WHERE username = ?'
  );
  let user = stmt.get(username);

  if (!user) {
    stmt = request.server.db.prepare(
      'INSERT INTO users (name, username, email) VALUES (?, ?, ?)'
    );
    const info = stmt.run(name, username, email);
    return reply.code(201).send({ userId: info.lastInsertRowid });
  } else {
    return reply.code(400).send({ message: 'User with the provided username already exists.' });
  }
}

export async function addScore(request, reply) {
  const { username, score } = request.body;
  const db = request.server.db;

  const user = db.prepare(
    'SELECT id FROM users WHERE username = ?'
  ).get(username);

  if (!user) {
    return reply.code(400).send({ message: 'User does not exist.' });
  }

  const updateStmt = db.prepare(
    'UPDATE scores SET score = ?, played = CURRENT_TIMESTAMP WHERE user_id = ?'
  );
  const info = updateStmt.run(score, user.id);

  if (info.changes === 0) {
    db.prepare(
      'INSERT INTO scores (user_id, score) VALUES (?, ?)'
    ).run(user.id, score);
  }

  return reply.code(200).send({ userId: user.id });
}