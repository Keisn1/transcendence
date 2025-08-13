import { AuthStorage } from "../auth/auth.storage";
import { type GetMatchResponse, type PostMatchBody } from "../../types/match.types";
//declared but never read? import { AuthService } from "../auth/auth.service";

export class MatchService {
    private static instance: MatchService;

    private constructor() {}

    static getInstance(): MatchService {
        if (!MatchService.instance) {
            MatchService.instance = new MatchService();
        }
        return MatchService.instance;
    }

    async saveMatch(match: PostMatchBody): Promise<void> {
        console.log(match);
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

    // TODO: erik: make getUserMatches and getMatchesByUser one function with optional userId
    async getMatchesByUser(userId: string): Promise<GetMatchResponse[]> {
        if (!userId) throw new Error("User not authenticated");

        const response = await fetch(`/api/match/user/${userId}`, {
            headers: {
                Authorization: `Bearer ${AuthStorage.getToken()}`,
            },
        });

        if (!response.ok) {
            throw new Error("Failed to fetch matches");
        }

        return response.json();
    }
}
