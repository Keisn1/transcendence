import { FastifyRequest, FastifyReply } from "fastify";
import speakeasy from "speakeasy";
import qrcode from "qrcode";
import { complete2FABody } from "../types/auth.types";

// Create or update 2FA secret and return QR code
export async function init2FA(request: FastifyRequest, reply: FastifyReply) {
    const user = request.user;
    if (!user) return reply.status(401).send({ error: "Unauthorized" });

    const secret = speakeasy.generateSecret({
        name: `Transcendence (${user.username})`,
    });

    const qrCodeSvg = await qrcode.toString(secret.otpauth_url!, { type: "svg" });

    await request.server.db.run(`UPDATE users SET twofa_secret = ? , updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [
        secret.base32,
        user.id,
    ]);

    return reply.send({ qrCodeSvg });
}

// Complete setup by verifying token and enabling 2FA
export async function complete2FA(request: FastifyRequest, reply: FastifyReply) {
    const user = request.user;
    if (!user) return reply.status(401).send({ error: "Unauthorized" });

    const { token } = request.body as complete2FABody;
    if (!token) return reply.status(400).send({ error: "Missing token" });

    const rows = await request.server.db.query(`SELECT twofa_secret FROM users WHERE id = ?`, [user.id]);

    const row = rows[0];
    if (!row?.twofa_secret) return reply.status(400).send({ error: "No 2FA setup in progress" });

    const verified = speakeasy.totp.verify({
        secret: row.twofa_secret,
        encoding: "base32",
        token,
    });

    if (!verified) {
        return reply.status(400).send({ error: "Invalid 2FA code" });
    }

    await request.server.db.run(`UPDATE users SET twofa_enabled = 1 , updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [
        user.id,
    ]);

    return reply.send({ success: true });
}

export const complete2FASchema = {
    body: {
        type: "object",
        properties: {
            token: { type: "string" },
        },
        required: ["token"],
        additionalProperties: false,
    },
    response: {
        200: {
            type: "object",
            properties: {
                success: { type: "boolean" },
            },
            required: ["success"],
            additionalProperties: false,
        },
    },
} as const;
