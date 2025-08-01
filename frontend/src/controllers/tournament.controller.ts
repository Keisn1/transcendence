import { TournamentEvent, TournamentMachine } from "../components/tournament/tournament.machine.ts";
import Router from "../router";
import { TournamentService } from "../services/tournament/tournament.service.ts";
import type { TournamentCreationBody, RegisterPlayerBody, User, Tournament } from "../types/tournament.types.ts";

export class TournamentController {
    private static instance: TournamentController;
    private tournamentService: TournamentService;
    private currentTournament: Tournament | null = null;
    private tournamentMachine: TournamentMachine | null = null; // Controller manages state
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

    public async createTournament(userIds: TournamentCreationBody): Promise<Tournament> {
        console.log("controller is creating tournament");
        const tournament = await this.tournamentService.createTournament(userIds);
        console.log(tournament.matches);

        // Controller initializes and manages the state machine
        this.tournamentMachine = new TournamentMachine(tournament.matches);
        this.tournamentMachine.update(TournamentEvent.LOAD);

        this.currentTournament = tournament;
        this.router.navigateTo(`/tournament/${tournament.id}`, { state: { tournament } });

        return tournament;
    }

    public async getTournament() {
        return this.currentTournament;
    }

    getTournamentMachine(): TournamentMachine | null {
        return this.tournamentMachine;
    }

    // Controller handles state transitions
    startMatch(): void {
        this.tournamentMachine?.update(TournamentEvent.START);
    }

    finishMatch(result: string): void {
        // Update tournament data
        if (this.currentTournament) {
            const matchIndex = this.currentTournament.matches.findIndex((m) => !m.result);
            if (matchIndex >= 0) {
                this.currentTournament.matches[matchIndex].result = result;
            }
        }
        // Update state machine
        this.tournamentMachine?.update(TournamentEvent.FINISH);
    }
}
