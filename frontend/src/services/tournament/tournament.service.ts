import type { TournamentCreationBody, RegisterPlayerBody, User, Tournament } from "../../types/tournament.types.ts";
import { AuthService } from "../auth/auth.service";

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
			throw new Error("Player registration failed");
		}

		const { user } = await response.json() as { user: User };
		return user;
	}

	async createTournament(body: TournamentCreationBody): Promise<Tournament> {
		const res = await fetch("/api/tournament", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${this.authService.getAuthToken()}`,
			},
			body: JSON.stringify(body),
		});
		// console.log(body);
		// console.log(res.ok);
		// console.log("status:", res.status, "statusText:", res.statusText);
		if (!res.ok) throw new Error("Couldn’t create tournament");

		return res.json();
	}

}