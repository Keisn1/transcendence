import type { TournamentCreationBody, RegisterPlayerBody } from "../../types/tournament.types.ts";
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

	async registerPlayer(userCredentials: RegisterPlayerBody): Promise<void> {
		const response = await fetch("/api/verify-player", {
			method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${this.authService.getAuthToken()}`,
				},
				body: JSON.stringify(userCredentials),
		});

		if (!response.ok) throw new Error("Player Registration failed");
	
		// TODO: not sure of what to do with the user object
		const data = await response.json();
		console.log(data);
	}

	async createTounament(usersCredentials: TournamentCreationBody): Promise<void> {
		
	}
}