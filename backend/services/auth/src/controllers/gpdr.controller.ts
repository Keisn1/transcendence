import { FastifyRequest, FastifyReply } from "fastify";

export async function deleteUser(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user.id;

    try {
        await request.server.db.run(
            "UPDATE users SET username = ?, email = ?, password_hash = '', updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            [`anon_${Date.now()}`, `anon_${Date.now()}@example.com`, userId],
        );

        reply.status(200).send({ success: true });
    } catch (error) {
        console.error("anonymizeUser error:", error);
        return reply.status(500).send({ error: "Deletion of User failed" });
    }
}

export async function anonymizeUser(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user.id;

    try {
        console.log("Preparing to delete user ID:", userId);
        const result = await request.server.db.run("DELETE FROM users WHERE id = ?", [userId]);
        console.log("Rows deleted:", result.changes);
        console.log(result);
        // console.log(user);

        const userRows = await request.server.db.query("SELECT * FROM users WHERE id = ?", [userId]);
        console.log("User still exists after delete?", userRows[0]); // Should be undefined if deleted
        reply.status(200).send({ success: true });
    } catch (error) {
        console.error("anonymizeUser error:", error);
        return reply.status(500).send({ error: "Anonymization failed" });
    }
}
