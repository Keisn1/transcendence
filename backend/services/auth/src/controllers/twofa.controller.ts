import { FastifyRequest, FastifyReply } from "fastify";
import speakeasy from "speakeasy";
import qrcode from "qrcode";
import { complete2FABody, Complete2FaResponse } from "../types/auth.types";

function validateTwoFAToken(token: string): boolean {
    return /^\d{6}$/.test(token); // 6-digit numeric code
}

export async function disable2FA(request: FastifyRequest, reply: FastifyReply) {
    const user = request.user;
    const { token } = request.body as { token: string };

    // First verify the 2FA token using encrypted secret
    const secret = await request.server.db.get2FASecret(user.id);
    if (!secret) {
        return reply.status(400).send({ error: "2FA not configured" });
    }

    const verified = speakeasy.totp.verify({
        secret: secret,
        encoding: "base32",
        token,
    });

    if (!verified) {
        return reply.status(400).send({ error: "Invalid 2FA code" });
    }

    // Disable 2FA using the new method
    await request.server.db.disable2FA(user.id);

    return reply.send({ success: true });
}

export async function verify2FA(request: FastifyRequest, reply: FastifyReply) {
    const user = request.user;
    const { token } = request.body as { token: string };
    if (!token) return reply.status(400).send({ error: "Missing token" });

    if (!token || !validateTwoFAToken(token)) {
        return reply.status(400).send({ error: "Invalid 2FA code format" });
    }

    // Check if 2FA is enabled and get encrypted secret
    const rows = await request.server.db.query(`SELECT twofa_enabled FROM users WHERE id = ?`, [user.id]);
    const row = rows[0];

    if (!row?.twofa_enabled) {
        return reply.status(400).send({ error: "2FA not enabled" });
    }

    // Get decrypted secret
    const secret = await request.server.db.get2FASecret(user.id);
    if (!secret) {
        return reply.status(400).send({ error: "2FA not properly configured" });
    }

    const verified = speakeasy.totp.verify({
        secret: secret,
        encoding: "base32",
        token,
    });

    if (!verified) {
        return reply.status(400).send({ error: "Invalid 2FA code" });
    }

    return reply.send({ success: true });
}

// Create or update 2FA secret and return QR code
export async function init2FA(request: FastifyRequest, reply: FastifyReply) {
    const user = request.user;
    if (!user) return reply.status(401).send({ error: "Unauthorized" });

    const secret = speakeasy.generateSecret({
        name: `Transcendence (${user.username})`,
    });

    const qrCodeSvg = await qrcode.toString(secret.otpauth_url!, { type: "svg" });

    // Store encrypted secret using the new method
    await request.server.db.store2FASecret(user.id, secret.base32);

    return reply.send({ qrCodeSvg });
}

// Complete setup by verifying token and enabling 2FA
export async function complete2FA(request: FastifyRequest, reply: FastifyReply): Promise<Complete2FaResponse> {
    const user = request.user;
    if (!user) return reply.status(401).send({ error: "Unauthorized" });

    const { token } = request.body as complete2FABody;
    if (!token) return reply.status(400).send({ error: "Missing token" });

    if (!token || !validateTwoFAToken(token)) {
        return reply.status(400).send({ error: "Invalid 2FA code format" });
    }

    // Get decrypted secret to verify
    const secret = await request.server.db.get2FASecret(user.id);
    if (!secret) return reply.status(400).send({ error: "No 2FA setup in progress" });

    const verified = speakeasy.totp.verify({
        secret: secret,
        encoding: "base32",
        token,
    });

    if (!verified) {
        return reply.status(400).send({ error: "Invalid 2FA code" });
    }

    // Enable 2FA using the new method
    await request.server.db.enable2FA(user.id);

    user.twoFaEnabled = true;
    const jwtToken = request.server.jwt.sign(user, { expiresIn: "1h" });
    const response: Complete2FaResponse = { token: jwtToken, user: user };
    return reply.status(200).send(response);
}

export const verify2FASchema = {
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
                token: { type: "string" },
                user: {
                    type: "object",
                    properties: {
                        id: { type: "string" },
                        username: { type: "string" },
                        avatar: { type: "string", format: "uri-reference" },
                        twoFaEnabled: { type: "boolean" },
                    },
                    required: ["id", "username", "avatar", "twoFaEnabled"],
                },
            },
            additionalProperties: false,
        },
    },
} as const;
