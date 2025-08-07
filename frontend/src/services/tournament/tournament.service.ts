import { AuthService } from "../auth/auth.service";
import type { RegisterPlayerBody } from "../../types/tournament.types.ts";
import { type User } from "../../types/auth.types.ts";
import { TournamentDTO } from "../../controllers/tournament.controller.ts";

export class TournamentService {
    private static instance: TournamentService;
    private authService: AuthService;

    private constructor() {
        this.authService = AuthService.getInstance();
    }

    static getInstance(): TournamentService {
        if (!TournamentService.instance) {
            TournamentService.instance = new TournamentService();
        }
        return TournamentService.instance;
    }

    async registerPlayer(userCredentials: RegisterPlayerBody): Promise<User> {
        const response = await fetch("/api/verify-player", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.authService.getAuthToken()}`,
            },
            body: JSON.stringify(userCredentials),
        });

        if (!response.ok) {
            const errMsg = await response.text();
            throw new Error(`Player registration failed: ${errMsg}`);
        }

        const { user } = (await response.json()) as { user: User };
        return user;
    }

    async createTournament(tournamentDTO: TournamentDTO): Promise<void> {
        const response = await fetch("/api/tournament", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.authService.getAuthToken()}`,
            },
            body: JSON.stringify(tournamentDTO),
        });

        if (!response.ok) {
            const errMsg = await response.text();
            throw new Error(`Failed to save tournament: ${errMsg}`);
        }
    }
}
