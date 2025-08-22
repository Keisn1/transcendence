import { FastifyRequest, FastifyReply } from "fastify";
import fs from "fs/promises";
import path from "path";

export default async function deleteAvatar(
    request: FastifyRequest<{ Params: { filename: string } }>,
    reply: FastifyReply,
) {
    const { filename } = request.params;

    // Comprehensive protection for default avatar
    const isDefaultAvatar =
        filename === "default-pfp.png" ||
        filename === "/uploads/default-pfp.png" ||
        filename.endsWith("/default-pfp.png");

    if (isDefaultAvatar) {
        console.warn("Attempted to delete default avatar: ${filename}");
        return reply.code(400).send({
            error: "Cannot delete default avatar",
            filename: filename,
        });
    }

    // Additional safety: check if file actually exists in uploads
    const safePath = path.basename(filename); // Remove any path traversal

    if (safePath !== filename) {
        console.warn(`Suspicious filename detected: ${filename}`);
        return reply.code(400).send({ error: "Invalid filename" });
    }

    // Don't delete default avatar
    if (filename === "default-pfp.png") {
        return reply.code(400).send({ error: "Cannot delete default avatar" });
    }

    try {
        const filepath = path.join("/app/uploads", filename);
        await fs.unlink(filepath);
        return reply.send({ success: true, message: "Avatar deleted" });
    } catch (error) {
        return reply.send({
            success: true,
            message: "Avatar already deleted or not found",
        });
    }
}
