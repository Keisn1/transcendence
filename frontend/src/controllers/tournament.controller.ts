import { TournamentEvent, TournamentMachine } from "./tournament.machine.ts";
import Router from "../router";
import { TournamentService } from "../services/tournament/tournament.service.ts";
import type {
    TournamentCreationBody,
    RegisterPlayerBody,
    User,
    Tournament,
    GameResult,
} from "../types/tournament.types.ts";

export class TournamentController {
    private static instance: TournamentController;
    private tournamentService: TournamentService;
    private tournament: Tournament | null = null;
    private tournamentMachine: TournamentMachine; // Controller manages state
    private router: Router;

    private constructor(router: Router) {
        this.tournamentService = TournamentService.getInstance();
        this.tournamentMachine = new TournamentMachine();
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
        this.tournamentMachine.update(TournamentEvent.LOAD, tournament);
        this.tournament = tournament;
        this.router.navigateTo(`/tournament`);

        return tournament;
    }

    public getTournament() {
        return this.tournament;
    }

    getTournamentMachine(): TournamentMachine {
        return this.tournamentMachine;
    }

    // Controller handles state transitions
    startMatch(): void {
        this.tournamentMachine?.update(TournamentEvent.START, this.tournament!);
        this.router.navigateTo(`/tournament`);
    }

    finishMatch(result: GameResult): void {
        // Update tournament data
        if (this.tournament) {
            const matchIndex = this.tournament.matches.findIndex((m) => !m.result);
            if (matchIndex >= 0) {
                this.tournament.matches[matchIndex].result = result;
            }
        }

        console.log("Finished match");
        // Update state machine
        this.tournamentMachine?.update(TournamentEvent.FINISH, this.tournament!);
        this.router.navigateTo("/tournament");
    }

    exitTournament(): void {
        this.tournament = null;
        this.tournamentMachine = new TournamentMachine();
        this.router.navigateTo("/tournament");
    }
}
