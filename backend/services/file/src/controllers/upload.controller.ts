import { FastifyRequest, FastifyReply } from "fastify";
import path from "path";
import fs from "fs/promises";

export default async function uploadAvatar(
    request: FastifyRequest,
    reply: FastifyReply,
) {
    const data = await request.file();

    if (!data) {
        return reply.code(400).send({ error: "No file provided" });
    }

    // Check if it's an image and specifically allowed formats
    const allowedMimeTypes = [
        "image/gif",
        "image/jpeg",
        "image/jpg",
        "image/png",
    ];
    if (!allowedMimeTypes.includes(data.mimetype)) {
        return reply.code(400).send({
            error: "Invalid file format. Only GIF, JPEG, and PNG images are allowed",
        });
    }

    const filename = `avatar-${Date.now()}.${data.filename.split(".").pop()}`;
    const filepath = path.join("/app/uploads", filename);

    await fs.writeFile(filepath, await data.toBuffer());

    return {
        filename,
        url: `/uploads/${filename}`,
    };
}
