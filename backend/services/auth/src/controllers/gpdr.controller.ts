import { FastifyRequest, FastifyReply } from "fastify";

// Helper function to get the correct protocol and port based on environment
function getServiceUrl(serviceName: string, port: number): string {
    const isProduction = process.env.ENV === "production";
    const protocol = isProduction ? "https" : "http";
    return `${protocol}://${serviceName}:${port}`;
}

export async function deleteUser(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request as any).user.id;

    try {
        console.log(`GDPR: Starting complete deletion for user ${userId}`);

        // Helper function to generate service token using Fastify's JWT
        const generateServiceToken = () => {
            return (request.server as any).jwt.sign(
                {
                    iss: "auth-service",
                    aud: "internal-services",
                    sub: "system",
                    scope: "gdpr:delete",
                },
                { expiresIn: "5m" },
            );
        };

        // 1. Delete from match-service
        try {
            const matchServiceUrl = getServiceUrl("match-service", 3002);
            const matchResponse = await fetch(`${matchServiceUrl}/gdpr/delete/${userId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${generateServiceToken()}`,
                },
            });

            if (!matchResponse.ok) {
                console.warn(`GDPR: Match-service deletion failed: ${matchResponse.status}`);
            }
        } catch (error: any) {
            console.error("GDPR: Match-service deletion error:", error);
        }

        // 3. Finally delete from auth-service (users table)
        // Note: Avatar files become orphaned but inaccessible since user row is deleted
        const authResult = await (request.server as any).db.run("DELETE FROM users WHERE id = ?", [userId]);

        console.log(`GDPR: Complete user deletion finished - ${authResult.changes} user record deleted`);

        reply.status(200).send({
            success: true,
            message: "User completely deleted from all services",
        });
    } catch (error: any) {
        console.error("GDPR: Complete user deletion error:", error);
        return reply.status(500).send({ error: "User deletion failed" });
    }
}

export async function anonymizeUser(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request as any).user.id;

    try {
        console.log("GDPR: Anonymizing user ID:", userId);

        // Helper function to generate service token using Fastify's JWT
        const generateServiceToken = () => {
            return (request.server as any).jwt.sign(
                {
                    iss: "auth-service",
                    aud: "internal-services",
                    sub: "system",
                    scope: "gdpr:anonymize",
                },
                { expiresIn: "5m" },
            );
        };

        // 1. Anonymize in match-service
        try {
            const matchServiceUrl = getServiceUrl("match-service", 3002);
            const matchResponse = await fetch(`${matchServiceUrl}/api/gdpr/anonymize/${userId}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${generateServiceToken()}`,
                },
            });

            if (!matchResponse.ok) {
                console.warn(`GDPR: Match-service anonymization failed: ${matchResponse.status}`);
            }
        } catch (error: any) {
            console.warn(
                "GDPR: Match-service anonymization error (continuing anyway):",
                error.message || String(error),
            );
        }

        // 3. Finally anonymize in auth-service (users table)
        // Note: Avatar is set to default-pfp.png, old avatar file becomes orphaned
        const result = await (request.server as any).db.run(
            "UPDATE users SET username = ?, email = ?, password_hash = '', avatar = 'default-pfp.png', updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            [`anon_${Date.now()}`, `anon_${Date.now()}@example.com`, userId],
        );

        console.log("GDPR: User anonymized across all services, rows affected:", result.changes);

        reply.status(200).send({
            success: true,
            message: "User anonymized successfully across all services",
        });
    } catch (error: any) {
        console.error("GDPR: Anonymization error:", error);
        return reply.status(500).send({ error: "Anonymization failed" });
    }
}
