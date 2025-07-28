import type { TournamentCreationBody, RegisterPlayerBody, User, Tournament } from "../types/tournament.types.ts";
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

	public async registerPlayer(userCredentials: RegisterPlayerBody): Promise<User> {
		const user = await this.tournamentService.registerPlayer(userCredentials);
		// this.router.navigateTo(""); // TODO: does it need to navigate to somewhere else?
		return user;
	}

	public async createTournament(userIds: TournamentCreationBody):Promise<Tournament> {
		const tournament = await this.tournamentService.createTournament(userIds);
		// this.router.navigateTo(""); // TODO: not implemented navigation
		return tournament;
	}
}