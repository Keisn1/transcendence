import { AuthStorage } from "../auth/auth.storage";

export interface MatchBody {
    player1Id: string;
    player2Id: string;
    player1Score: number;
    player2Score: number;
    gameMode: "pvp" | "ai-easy" | "ai-hard";
    duration?: number;
}

export class MatchService {
    private static instance: MatchService;

    private constructor() {}

    static getInstance(): MatchService {
        if (!MatchService.instance) {
            MatchService.instance = new MatchService();
        }
        return MatchService.instance;
    }

    async saveMatch(match: MatchBody): Promise<void> {
        const response = await fetch("/api/match", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${AuthStorage.getToken()}`,
            },
            body: JSON.stringify(match),
        });

        if (!response.ok) {
            const errMsg = await response.text();
            throw new Error(`Failed to save match result: ${errMsg}`);
        }
    }
}
