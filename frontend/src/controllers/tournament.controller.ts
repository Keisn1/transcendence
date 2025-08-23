import { TournamentEvent, TournamentMachine, TournamentState } from "./tournament.machine.ts";
import Router from "../router";
import { TournamentService } from "../services/tournament/tournament.service.ts";
import type { MatchResult, Match, PostMatchBody } from "../types/match.types.ts";
import type { PublicUser } from "../types/auth.types.ts";
import { v4 as uuidv4 } from "uuid";
import { MatchService } from "../services/match/match.service.ts";
import type { GameMode } from "../types/game.types.ts";

export class Tournament {
    id: string = "";
    players: PublicUser[] = [];
    matches: Match[] = [];
    nextMatchIdx: number = 0;
    state: string = TournamentState.UNINITIALIZED;

    constructor(players?: PublicUser[]) {
        if (!players) return;
        this.players = players;
        this.buildRound(players);
    }

    buildRound(players: PublicUser[]) {
        for (let i = 0; i < players.length; i += 2) {
            const p1 = players[i];
            const p2 = players[i + 1];
            const initialResult: MatchResult = { player1Score: 0, player2Score: 0 };

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
        const winners = this.matches.map((m) => {
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
    private tournamentDefault: Tournament;
    private tournamentMachine: TournamentMachine; // Controller manages state
    private tournamentMachineDefault: TournamentMachine;
    private router: Router;
    private gameStartTime: number = 0;

    private constructor(router: Router) {
        this.tournamentService = TournamentService.getInstance();
        this.tournamentMachine = new TournamentMachine();
        this.tournamentMachineDefault = new TournamentMachine();
        this.tournament = new Tournament();
        this.tournamentDefault = new Tournament();
        this.router = router;
    }

    public static getInstance(router?: Router): TournamentController {
        if (!TournamentController.instance && router) {
            TournamentController.instance = new TournamentController(router);
        }
        return TournamentController.instance;
    }

    public async createTournament(players: PublicUser[]): Promise<void> {
        const tournament = new Tournament(players);

        tournament.id = await this.tournamentService.createTournament(tournament);

        this.tournament = tournament;
        this.tournamentMachine.update(TournamentEvent.LOAD, this.tournament);
        this.router.navigateTo(`/tournament`);
    }

    public async createTournamentDefault(players: PublicUser[]): Promise<void> {
        this.tournamentDefault = new Tournament(players);
        this.tournamentMachineDefault.update(TournamentEvent.LOAD, this.tournamentDefault);
        this.router.navigateTo(`/tournament-default`);
    }

    public getTournament() {
        return this.tournament;
    }

    public getTournamentDefault() {
        return this.tournamentDefault;
    }

    getTournamentMachine(): TournamentMachine {
        return this.tournamentMachine;
    }

    getTournamentMachineDefault(): TournamentMachine {
        return this.tournamentMachineDefault;
    }

    // Controller handles state transitions
    startMatch(): void {
        console.log("start button clicked");
        this.gameStartTime = Date.now(); // Add this line
        this.tournamentMachine?.update(TournamentEvent.START, this.tournament!);
        this.router.navigateTo(`/tournament`);
    }

    startMatchDefault(): void {
        console.log("starting default match");
        this.tournamentMachineDefault?.update(TournamentEvent.START, this.tournamentDefault!);
        this.router.navigateTo(`/tournament-default`);
    }

    async finishMatch(result: MatchResult) {
        this.tournament.matches[this.tournament.nextMatchIdx].result = result;
        this.tournament.nextMatchIdx++;
        if (!this.tournament.hasMoreMatches()) this.tournament.generateNextRound();

        await this.saveMatchToBackend(result);

        this.tournamentMachine?.update(TournamentEvent.FINISH, this.tournament);
        this.router.navigateTo("/tournament");
    }

    private async saveMatchToBackend(result: MatchResult): Promise<void> {
        try {
            const currentMatch = this.tournament.matches[this.tournament.nextMatchIdx - 1]; // -1 because we already incremented
            const duration = Date.now() - this.gameStartTime; // You'll need to track this

            const matchBody: PostMatchBody = {
                player1Id: currentMatch.player1.id,
                player2Id: currentMatch.player2.id,
                player1Score: result.player1Score,
                player2Score: result.player2Score,
                gameMode: "tournament" as GameMode,
                duration,
                tournamentId: this.tournament.id,
            };

            const matchService = MatchService.getInstance();
            await matchService.saveMatch(matchBody);
            console.log("Tournament match saved to backend");
        } catch (error) {
            console.error("Failed to save tournament match:", error);
        }
    }

    finishMatchDefault(result: MatchResult): void {
        this.tournamentDefault.matches[this.tournamentDefault.nextMatchIdx].result = result;
        this.tournamentDefault.nextMatchIdx++;
        if (!this.tournamentDefault.hasMoreMatches()) this.tournamentDefault.generateNextRound();
        this.tournamentMachineDefault?.update(TournamentEvent.FINISH, this.tournamentDefault);
        this.router.navigateTo("/tournament-default");
    }

    exitTournament(): void {
        this.tournament = new Tournament();
        this.tournamentMachine = new TournamentMachine();
        this.router.navigateTo("/tournament");
    }

    exitTournamentDefault(): void {
        this.tournamentDefault = new Tournament();
        this.tournamentMachineDefault = new TournamentMachine();
        this.router.navigateTo("/tournament-default");
    }

    public async createTournamentWithVerification(playerTokens: { user: PublicUser; token: string }[]): Promise<void> {
        const players = playerTokens.map((pt) => pt.user);
        const tournament = new Tournament(players);

        tournament.id = await this.tournamentService.createTournamentWithVerification(playerTokens);

        this.tournament = tournament;
        this.tournamentMachine.update(TournamentEvent.LOAD, this.tournament);
        this.router.navigateTo(`/tournament`);
    }
}
