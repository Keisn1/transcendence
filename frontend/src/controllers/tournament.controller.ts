import type { TournamentCreationBody, RegisterPlayerBody } from "../types/tournament.types.ts";
import { TournamentService } from "../services/tournament/tournament.service.ts"
import Router from "../router";

export class TournamentController {
	private tournamentService: TournamentService;
	private router: Router;
	private static instance: TournamentController;

	private constructor(router: Router) {
		this.tournamentService = TournamentService.getInstance();
		this.router = router;
	}

	public static getInstance(router?: Router): TournamentController {
		if (!TournamentController.instance && router) {
			TournamentController.instance = new TournamentController(router);
		}
		return TournamentController.instance;
	}

	public async registerPlayer(userCredentials: RegisterPlayerBody) {
		await this.tournamentService.registerPlayer(userCredentials);
		// this.router.navigateTo(""); // TODO: does it need to navigate to somewhere else?
	}

	public async registerPlayers(usersCredentials: TournamentCreationBody) {
		await this.tournamentService.register(usersCredentials);
		this.router.navigateTo(""); // TODO: not implemented navigation
	}
}