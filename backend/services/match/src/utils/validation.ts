export function isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
}

export function isValidGameMode(mode: string): mode is "pvp" | "ai-easy" | "ai-hard" | "tournament" {
    return ["pvp", "ai-easy", "ai-hard", "tournament"].includes(mode);
}

export function isValidScore(score: any): boolean {
    return typeof score === "number" && Number.isInteger(score) && score >= 0 && score <= 999; // Reasonable max score
}

export function isValidDuration(duration: any): boolean {
    return typeof duration === "number" && duration > 0 && duration <= 3600000; // Max 1 hour in milliseconds
}

const KNOWN_IDS = [
    "00000000-0000-0000-0000-000000000000",
    "00000000-0000-0000-0000-000000000001",
    "00000000-0000-0000-0000-000000000002",
];

export function validateMatchData(data: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Required fields
    if (
        !data.player1Id ||
        !data.player2Id ||
        data.player1Score === undefined ||
        data.player2Score === undefined ||
        !data.gameMode
    ) {
        errors.push("Missing required fields");
        return { valid: false, errors };
    }

    // Player ID validation
    if (!KNOWN_IDS.includes(data.player1Id) && !isValidUUID(data.player1Id)) {
        errors.push("Invalid player1Id format");
    }
    if (!KNOWN_IDS.includes(data.player2Id) && !isValidUUID(data.player2Id)) {
        errors.push("Invalid player2Id format");
    }

    // Players can't be the same (except for AI games)
    if (data.player1Id === data.player2Id && !["ai-easy", "ai-hard"].includes(data.gameMode)) {
        errors.push("Players cannot be the same");
    }

    // Score validation
    if (!isValidScore(data.player1Score)) {
        errors.push("Invalid player1Score");
    }
    if (!isValidScore(data.player2Score)) {
        errors.push("Invalid player2Score");
    }

    // Game mode validation
    if (!isValidGameMode(data.gameMode)) {
        errors.push("Invalid game mode");
    }

    // Duration validation (optional field)
    if (data.duration !== undefined && !isValidDuration(data.duration)) {
        errors.push("Invalid duration");
    }

    // Tournament-specific validation
    if (data.gameMode === "tournament") {
        if (!data.tournamentId || !isValidUUID(data.tournamentId)) {
            errors.push("Tournament matches require valid tournamentId");
        }
    }

    // AI game validation
    if (data.gameMode === "ai-easy" && data.player2Id !== "00000000-0000-0000-0000-000000000001") {
        errors.push("AI Easy games must use correct AI player ID");
    }
    if (data.gameMode === "ai-hard" && data.player2Id !== "00000000-0000-0000-0000-000000000002") {
        errors.push("AI Hard games must use correct AI player ID");
    }

    return { valid: errors.length === 0, errors };
}
