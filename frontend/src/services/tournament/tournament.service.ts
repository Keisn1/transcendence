import { AuthService } from "../auth/auth.service";
import type { RegisterPlayerBody } from "../../types/tournament.types.ts";
import { type User } from "../../types/auth.types.ts";
import { Tournament } from "../../controllers/tournament.controller.ts";

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

        if (!response.ok) throw new Error("Player registration failed");

        const { user } = (await response.json()) as { user: User };
        return user;
    }

    async createTournament(tournament: Tournament): Promise<Tournament> {
        return tournament;
    }
}
