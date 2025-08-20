import { FastifyRequest, FastifyReply } from "fastify";

import https from "https";
import fetch from "node-fetch";
import fs from "fs";
import { Agent } from "http";
// Create agent once, reuse for all internal service calls

let internalServiceAgent: Agent = new Agent();
if (process.env.ENV === "production") {
    internalServiceAgent = new https.Agent({
        ca: fs.readFileSync("/vault/init/ca_cert.crt"), // Trust Vault's CA
        rejectUnauthorized: false, // Accept self-signed CA for internal services
    });
}

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
        const matchServiceUrl = getServiceUrl("match-service", 3002);

        let matchResponse = null;
        if (process.env.ENV === "production") {
            matchResponse = await fetch(`${matchServiceUrl}/gdpr/delete/${userId}`, {
                method: "DELETE",
                agent: internalServiceAgent,
                headers: {
                    Authorization: `Bearer ${generateServiceToken()}`,
                },
            });
        } else {
            matchResponse = await fetch(`${matchServiceUrl}/gdpr/delete/${userId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${generateServiceToken()}`,
                },
            });
        }

        if (!matchResponse.ok) {
            const errorText = await matchResponse.text().catch(() => "Unknown error");
            throw new Error(`Match-service deletion failed: ${matchResponse.status} - ${errorText}`);
        }

        
        const friendshipCount = await (request.server as any).db.query(
        "SELECT COUNT(*) as count FROM friendships WHERE requester_id = ? OR addressee_id = ?",
        [userId, userId]);
        
        // Delete all friendships where user is either requester or addressee
        const friendshipResult = await (request.server as any).db.query(
        "DELETE FROM friendships WHERE requester_id = ? OR addressee_id = ?",
        [userId, userId]);

        console.log(`GDPR: Deleted ${friendshipCount[0]?.count || 0} friendship records for user ${userId}`);

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
        return reply.status(500).send({
            error: "User deletion failed",
            details: error.message,
        });
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
            const matchResponse = await fetch(`${matchServiceUrl}/gdpr/anonymize/${userId}`, {
                method: "PUT",
                agent: internalServiceAgent,
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
        console.log(`GDPR: Deleting friendship data for anonymized user ${userId}`);
        
        const friendshipCount = await (request.server as any).db.query(
        "SELECT COUNT(*) as count FROM friendships WHERE requester_id = ? OR addressee_id = ?",
        [userId, userId]);
        
        await (request.server as any).db.query(
        "DELETE FROM friendships WHERE requester_id = ? OR addressee_id = ?",
        [userId, userId]);

        // 3. Finally anonymize in auth-service (users table)
        // Note: Avatar is set to default-pfp.png, old avatar file becomes orphaned
        const result = await (request.server as any).db.run(
            "UPDATE users SET username = ?, email = ?, password_hash = '', avatar = '/uploads/default-pfp.png', updated_at = CURRENT_TIMESTAMP WHERE id = ?",
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

export async function downloadUserData(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request as any).user.id;

    try {
        console.log("GDPR: Downloading user data for user ID:", userId);

        // Helper function to generate service token using Fastify's JWT
        const generateServiceToken = () => {
            return (request.server as any).jwt.sign(
                {
                    iss: "auth-service",
                    aud: "internal-services",
                    sub: "system",
                    scope: "gdpr:download",
                },
                { expiresIn: "5m" },
            );
        };

        // 1. Get user data from auth-service
        const userData = await (request.server as any).db.query(
            "SELECT id, username, email, avatar, twofa_enabled, created_at, updated_at FROM users WHERE id = ?",
            [userId],
        );

        if (!userData || userData.length === 0) {
            return reply.status(404).send({ error: "User not found" });
        }

        const user = userData[0];

        const friendshipData = await (request.server as any).db.query(
            `
            SELECT 
                f.id, 
                f.status, 
                f.created_at, 
                f.updated_at,
                CASE 
                    WHEN f.requester_id = ? THEN 'sent'
                    ELSE 'received'
                END as request_type,
                CASE 
                    WHEN f.requester_id = ? THEN u2.username
                    ELSE u1.username
                END as other_user_username
            FROM friendships f
            LEFT JOIN users u1 ON f.requester_id = u1.id
            LEFT JOIN users u2 ON f.addressee_id = u2.id
            WHERE f.requester_id = ? OR f.addressee_id = ?
            ORDER BY f.created_at DESC
            `,
            [userId, userId, userId, userId],
        );

        // 2. Get match statistics from match-service
        let matchStats = {
            totalMatches: 0,
            matchesWon: 0,
            matchesLost: 0,
            matchHistory: [] as any[],
        };

        try {
            const matchServiceUrl = getServiceUrl("match-service", 3002);
            const matchResponse = await fetch(`${matchServiceUrl}/api/match/user/${userId}`, {
                method: "GET",
                agent: internalServiceAgent,
                headers: {
                    Authorization: `Bearer ${generateServiceToken()}`,
                },
            });

            if (matchResponse.ok) {
                const matches = (await matchResponse.json()) as any[];
                matchStats.matchHistory = matches;
                matchStats.totalMatches = matches.length;

                // Calculate wins/losses
                for (const match of matches) {
                    let userScore = null;
                    let opponentScore = null;

                    if (match.player1Id === userId) {
                        userScore = match.player1Score;
                        opponentScore = match.player2Score;
                    } else if (match.player2Id === userId) {
                        userScore = match.player2Score;
                        opponentScore = match.player1Score;
                    }

                    if (userScore !== null && opponentScore !== null) {
                        if (userScore > opponentScore) {
                            matchStats.matchesWon++;
                        } else {
                            matchStats.matchesLost++;
                        }
                    }
                }
            } else {
                console.warn(`GDPR: Failed to fetch match data: ${matchResponse.status}`);
            }
        } catch (error: any) {
            console.warn("GDPR: Match-service fetch error (continuing anyway):", error.message || String(error));
        }

        // 3. Compile user data export
        const userDataExport = {
            exportInfo: {
                exportDate: new Date().toISOString(),
                userId: user.id,
                exportType: "GDPR Data Request",
            },
            personalData: {
                username: user.username,
                email: user.email,
                avatar: user.avatar,
                twoFactorAuthEnabled: Boolean(user.twofa_enabled),
                accountCreated: user.created_at,
                lastUpdated: user.updated_at,
            },
            friendshipData: {
                totalFriendships: friendshipData.length,
                friendships: friendshipData.map((friendship: any) => ({
                    friendshipId: friendship.id,
                    status: friendship.status,
                    requestType: friendship.request_type,
                    otherUser: friendship.other_user_username,
                    createdAt: friendship.created_at,
                    updatedAt: friendship.updated_at,
                })),
            },
            statistics: {
                totalMatches: matchStats.totalMatches,
                matchesWon: matchStats.matchesWon,
                matchesLost: matchStats.matchesLost,
            },
            matchHistory: matchStats.matchHistory.map((match) => ({
                matchId: match.id,
                date: match.created_at,
                gameMode: match.gameMode,
                duration: match.duration,
                yourScore: match.player1Id === userId ? match.player1Score : match.player2Score,
                opponentScore: match.player1Id === userId ? match.player2Score : match.player1Score,
                result: (() => {
                    const yourScore = match.player1Id === userId ? match.player1Score : match.player2Score;
                    const opponentScore = match.player1Id === userId ? match.player2Score : match.player1Score;
                    return yourScore > opponentScore ? "won" : "lost";
                })(),
            })),
        };

        console.log("GDPR: User data export compiled successfully");

        reply.status(200).send({
            success: true,
            data: userDataExport,
        });
    } catch (error: any) {
        console.error("GDPR: Download user data error:", error);
        return reply.status(500).send({
            error: "Failed to download user data",
            details: error.message,
        });
    }
}
