import { FastifyRequest, FastifyReply } from "fastify";

export async function updateOnlineStatus(
    request: FastifyRequest<{ Body: { isOnline: boolean } }>,
    reply: FastifyReply,
) {
    const { isOnline } = request.body;

    if (typeof isOnline !== "boolean") {
        return reply.status(400).send({ error: "isOnline must be a boolean" });
    }

    const userId = request.user.id;

    await request.server.db.run("UPDATE users SET is_online = ?, last_seen = CURRENT_TIMESTAMP WHERE id = ?", [
        isOnline ? 1 : 0,
        userId,
    ]);

    return reply.send({ success: true });
}
