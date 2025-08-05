import { TournamentEvent, TournamentMachine, TournamentState } from "./tournament.machine.ts";
import Router from "../router";
import { TournamentService } from "../services/tournament/tournament.service.ts";
import type { RegisterPlayerBody, GameResult, Match } from "../types/tournament.types.ts";
import type { User } from "../types/auth.types.ts";
import { v4 as uuidv4 } from 'uuid';

export class Tournament {
    id: string = "";
    players: User[] = [];
    matches: Match[] = [];
    nextMatchIdx: number = 0;
    state: string = TournamentState.UNINITIALIZED;
    // currentRound: number = 0;

    constructor(players?: User[]) {
        if (!players) return;
        this.players = players;
        this.id = uuidv4();
        this.buildRound(players);
    }

    buildRound(players: User[]) {
        for (let i = 0; i < players.length; i += 2) {
            const p1 = players[i];
            const p2 = players[i + 1];
            const initialResult: GameResult = { player1Score: 0, player2Score: 0 };

            this.matches.push({
                matchId: uuidv4(),
                player1: p1,
                player2: p2,
                result: initialResult,
            });
        }
    }
    
    hasMoreMatches() {
        return this.matches.length != 0 && this.nextMatchIdx < this.matches.length;
    }
    
    generateNextRound() {
        if (this.matches.length <= 1 || this.matches.length === 3) return;
    
        // this.currentRound++;
        const winners = this.matches.map(m => {
            const { player1Score, player2Score } = m.result!;
            return player1Score >= player2Score ? m.player1 : m.player2;
        });

        if (winners.length <= 1) return;
        
        this.buildRound(winners);
    }
}

export class TournamentController {
    private static instance: TournamentController;
    private tournamentService: TournamentService;
    private tournament: Tournament;
    private tournamentMachine: TournamentMachine; // Controller manages state
    private router: Router;

    private constructor(router: Router) {
        this.tournamentService = TournamentService.getInstance();
        this.tournamentMachine = new TournamentMachine();
        this.tournament = new Tournament();
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

    public async createTournament(players: User[]) {
        console.log("controller is creating tournament");
        const tournament = new Tournament(players);
        console.log("nbr of matches: ", tournament.matches.length);

        await this.tournamentService.createTournament(tournament);
        console.log(tournament.matches);

        // Controller initializes and manages the state machine
        this.tournament = tournament;
        this.tournamentMachine.update(TournamentEvent.LOAD, this.tournament);
        this.router.navigateTo(`/tournament`);
        return;
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
        this.tournament.matches[this.tournament.nextMatchIdx].result = result;
        this.tournament.nextMatchIdx++;
        if (!this.tournament.hasMoreMatches()) this.tournament.generateNextRound();
        this.tournamentMachine?.update(TournamentEvent.FINISH, this.tournament);
        this.router.navigateTo("/tournament");
    }

    exitTournament(): void {
        this.tournament = new Tournament();
        this.tournamentMachine = new TournamentMachine();
        this.router.navigateTo("/tournament");
    }
}
