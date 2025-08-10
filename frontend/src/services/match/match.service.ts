import { AuthStorage } from "../auth/auth.storage";
import { type MatchBody } from "../../types/match.types";

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
}
