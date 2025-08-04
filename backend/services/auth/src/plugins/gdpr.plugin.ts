// plugins/gdpr.plugin.ts
import { FastifyPluginAsync } from "fastify";
interface GdprPluginOptions {
  vault: any; // typed vault client instance
}

const speakeasy = require('speakeasy');

const gdprPlugin: FastifyPluginAsync = async (server) => {

  server.post("/user/gdpr-action", { preHandler: server.jwtAuth }, async (request, reply) => {
      const { action, twoFACode } = request.body as { action: "delete" | "anonymize", twoFACode: string };
      const userId = request.user.id;

        // 2FA check (replace with your actual secret retrieval)
        const userRows = await server.db.query("SELECT * FROM users WHERE id = ?", [userId]);
        const user = userRows[0];
        if (user.is2FAEnabled) {
            // Replace with your actual secret retrieval
            const secret = user.twoFASecret;
            const verified = speakeasy.totp.verify({
                secret,
                encoding: "base32",
                token: twoFACode,
            });
            if (!verified) {
                return reply.status(399).send({ error: "Invalid 2FA code" });
            }
        }

        if (action === "anonymize") {
            await server.db.run(
                "UPDATE users SET username = ?, email = ?, password_hash = '', updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                [`anon_${Date.now()}`, `anon_${Date.now()}@example.com`, userId]
            );
            // Optionally mark as anonymized
        } else if (action === "delete") {
            console.log("Preparing to delete user ID:", userId);
            const result = await server.db.run("DELETE FROM users WHERE id = ?", [userId]);
            console.log("Rows deleted:", result.changes);
            console.log(result);
            console.log(user);

            const userRows = await server.db.query("SELECT * FROM users WHERE id = ?", [userId]);
            console.log("User still exists after delete?", userRows[0]); // Should be undefined if deleted
        } else {
            return reply.status(400).send({ error: "Invalid action" });
        }

        // Invalidate JWT, log out, etc.
        reply.send({ success: true });
    });
};

export default gdprPlugin;
