import type { TournamentCreationBody } from "../types/tournament.types.ts";
import { TournamentService } from "../services/tournament/tournament.service.ts"
import Router from "../router";

export class TournamentController {
	private tournamentService: TournamentService;
	private router: Router;

	private constructor(router: Router) {
		this.tournamentService = TournamentService.getInstance();
		this.router = router;
	}

	public async registerPlayers(usersCredentials: TournamentCreationBody) {
		await this.tournamentService.register(usersCredentials);
		this.router.navigateTo(""); // TODO: not implemented navigation
	}
}