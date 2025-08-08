import type { RegisterPlayerBody } from "../../types/tournament.types.ts";
import { type PublicUser } from "../../types/auth.types.ts";
import { TournamentDTO } from "../../controllers/tournament.controller.ts";
import { AuthStorage } from "../auth/auth.storage.ts";

export class TournamentService {
    private static instance: TournamentService;

    private constructor() {}

    static getInstance(): TournamentService {
        if (!TournamentService.instance) {
            TournamentService.instance = new TournamentService();
        }
        return TournamentService.instance;
    }

    async registerPlayer(userCredentials: RegisterPlayerBody): Promise<PublicUser> {
        const response = await fetch("/api/verify-player", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${AuthStorage.getToken()}`,
            },
            body: JSON.stringify(userCredentials),
        });

        if (!response.ok) {
            const errMsg = await response.text();
            throw new Error(`Player registration failed: ${errMsg}`);
        }

        const { user } = (await response.json()) as { user: PublicUser };
        return user;
    }

    async createTournament(tournamentDTO: TournamentDTO): Promise<void> {
        const response = await fetch("/api/tournament", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${AuthStorage.getToken()}`,
            },
            body: JSON.stringify(tournamentDTO),
        });

        if (!response.ok) {
            const errMsg = await response.text();
            throw new Error(`Failed to save tournament: ${errMsg}`);
        }
    }
}
