import Router from "../router";
import { TournamentService } from "../services/tournament/tournament.service.ts"
import type { TournamentCreationBody, RegisterPlayerBody, User, Tournament } from "../types/tournament.types.ts";

export class TournamentController {
	private static instance: TournamentController;
	private tournamentService: TournamentService;
	private currentTournament: Tournament | null = null;
	private router: Router;

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
		return user;
	}

	public async createTournament(userIds: TournamentCreationBody):Promise<Tournament> {
		const tournament = await this.tournamentService.createTournament(userIds);
		this.router.navigateTo(`/tournament/${tournament.id}`, { state: { initial: tournament } });
		this.currentTournament = tournament; // TODO: not sure of this approach
		return tournament;
	}

	public async getTournament() {
		return this.currentTournament;
	}
}