import gameTemplate from "./game.html?raw";
import { PongGame } from "../../game/game";
import { BaseComponent } from "../BaseComponent";
import { type MatchResult } from "../../types/match.types.ts";
import { GameControlsComponent } from "../gameControls/gameControlsGame/gameControls";
import { GameControlsTournamentComponent } from "../gameControls/gameControlsTournament/gameControlsTournament";
import type IGameControls from "../gameControls/IGameControls";
import { MatchService } from "../../services/match/match.service";
import { AuthService } from "../../services/auth/auth.service";
import { PlayersDisplay } from "../playersDisplay/playersDisplay.ts";
import type { PublicUser } from "../../types/auth.types.ts";
import type { PostMatchBody } from "../../types/match.types.ts";
import type { GameMode } from "../../types/game.types.ts";

type ControlsConstructor = (new () => GameControlsComponent) | (new () => GameControlsTournamentComponent);

interface GameComponentOptions {
    tournamentPlayers?: { player1: PublicUser; player2: PublicUser };
    tournamentId?: string;
}

export class GameComponent extends BaseComponent {
    private canvas: HTMLCanvasElement;
    private game: PongGame;
    public gameControls: IGameControls;
    private playersDisplay: PlayersDisplay;

    private matchService: MatchService;
    private authService: AuthService;
    private currentGameMode: GameMode = "pvp";
    private gameStartTime: number = 0;
    private options: GameComponentOptions;

    constructor(ControlsClass: ControlsConstructor, options: GameComponentOptions = {}) {
        super("div", "game-container");
        this.options = options;

        this.container.innerHTML = gameTemplate;
        this.canvas = this.container.querySelector("#canvas")!;
        this.game = new PongGame(this.canvas);

        this.matchService = MatchService.getInstance();
        this.authService = AuthService.getInstance();

        this.gameControls = new ControlsClass() as IGameControls;
        this.gameControls.addToStartCallbacks(this.startCallback);
        if (!this.options.tournamentPlayers && this.gameControls.addToSelectionChangeCallbacks) {
            this.gameControls.addToSelectionChangeCallbacks(this.selectionChangeCallback);
        }

        this.container.appendChild(this.gameControls.getContainer());

        this.playersDisplay = new PlayersDisplay(this.canvas.width, this.options.tournamentPlayers);
        const playersDisplayContainer = this.container.querySelector("#players-display")!;
        playersDisplayContainer.appendChild(this.playersDisplay.getContainer());
    }

    private selectionChangeCallback = (mode: GameMode) => {
        this.playersDisplay.updateGameMode(mode);
    };

    private startCallback = (mode: GameMode) => {
        this.game.destroy();
        const ctx = this.canvas.getContext("2d")!;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.currentGameMode = mode;

        if (!this.options.tournamentPlayers) {
            this.playersDisplay.updateGameMode(this.currentGameMode);
        }

        this.gameStartTime = Date.now();

        this.game = new PongGame(this.canvas, {}, this.onGameFinish);
        if (mode === "ai-easy") {
            this.game.setAiDifficulty("easy");
        }
        if (mode === "ai-hard") {
            this.game.setAiDifficulty("hard");
        }
        this.play();
    };

    async play() {
        await this.game.start();
    }

    public getResult(): MatchResult {
        return this.game.getResult();
    }

    private onGameFinish = async () => {
        if (this.gameControls.toggleStartBtn) {
            this.gameControls.toggleStartBtn();
        }

        // Register game result to backend
        await this.saveMatch();
    };

    private async saveMatch() {
        try {
            if (!this.authService.isAuthenticated()) return;

            const result = this.getResult();
            const user = this.authService.getCurrentUser();
            const duration = Date.now() - this.gameStartTime;

            const matchBody: PostMatchBody = {
                player1Id: user!.id,
                player2Id: this.getPlayer2Name(),
                player1Score: result.player1Score,
                player2Score: result.player2Score,
                gameMode: this.currentGameMode,
                duration,
                tournamentId: this.options.tournamentId,
            };

            if (this.options.tournamentPlayers) {
                matchBody.player1Id = this.options.tournamentPlayers.player1.id;
                matchBody.player2Id = this.options.tournamentPlayers.player2.id;
            }

            await this.matchService.saveMatch(matchBody);
            console.log("Match result saved successfully");
        } catch (error) {
            console.error("Failed to save match result:", error);
        }
    }

    private getPlayer2Name(): string {
        switch (this.currentGameMode) {
            case "ai-easy":
                return "00000000-0000-0000-0000-000000000001";
            case "ai-hard":
                return "00000000-0000-0000-0000-000000000002";
            default:
                return "00000000-0000-0000-0000-000000000000";
        }
    }

    destroy() {
        super.destroy();
        this.gameControls.removeFromStartCallbacks(this.startCallback);
        if (this.gameControls.removeFromSelectionChangeCallbacks) {
            this.gameControls.removeFromSelectionChangeCallbacks(this.selectionChangeCallback);
        }
        this.playersDisplay.destroy();
        this.game.destroy();
        document.getElementById("game-container")?.remove();
    }
}
