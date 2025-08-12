import { FastifyRequest, FastifyReply } from "fastify";

export async function deleteUserData(request: any, reply: any) {
    const { userId } = request.params;

    try {
        // Delete all matches where user participated
        const matchResult = await request.server.db.run(
            "DELETE FROM matches WHERE player1Id = ? OR player2Id = ?", 
            [userId, userId]
        );

        // Delete tournament participations if table exists
        let tournamentResult = { changes: 0 };
        try {
            tournamentResult = await request.server.db.run(
                "DELETE FROM tournament_participants WHERE user_id = ?", 
                [userId]
            );
        } catch (error) {
            console.log("Tournament table might not exist, skipping...");
        }

        reply.status(200).send({ 
            success: true, 
            deletedMatches: matchResult.changes,
            deletedTournaments: tournamentResult.changes 
        });
    } catch (error) {
        console.error("Delete user match data error:", error);
        return reply.status(500).send({ error: "Failed to delete user match data" });
    }
}

export async function anonymizeUserData(request: any, reply: any) {
    const { userId } = request.params;

    try {
        // For anonymization, we keep the match records with their user IDs
        // The usernames are anonymized in the auth service, so when matches are displayed,
        // they will show the anonymized username from the users table
        
        // Count how many matches will remain with anonymized user data
        const matchCount = await request.server.db.query(
            "SELECT COUNT(*) as count FROM matches WHERE player1Id = ? OR player2Id = ?", 
            [userId, userId]
        );

        const count = matchCount[0]?.count || 0;

        reply.status(200).send({ 
            success: true,
            message: `User match data anonymized successfully. ${count} matches retained with anonymized user reference.`,
            anonymizedMatches: count
        });
    } catch (error) {
        console.error("Anonymize user match data error:", error);
        return reply.status(500).send({ error: "Failed to anonymize user match data" });
    }
}
