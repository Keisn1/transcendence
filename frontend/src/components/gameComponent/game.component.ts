import gameTemplate from "./game.html?raw";
import { PongGame } from "../../game/game";
import { BaseComponent } from "../BaseComponent";
import { type AiLevel } from "../../game/game";
import { type MatchResult } from "../../types/tournament.types";
import { GameControlsComponent } from "../gameControls/gameControlsGame/gameControls";
import { GameControlsTournamentComponent } from "../gameControls/gameControlsTournament/gameControlsTournament";
import type IGameControls from "../gameControls/IGameControls";
import { MatchService, type MatchBody } from "../../services/match/match.service";
import { AuthService } from "../../services/auth/auth.service";
import { PlayersDisplay } from "../playersDisplay/playersDisplay.ts";
import { v4 as uuidv4 } from "uuid";
import type { PublicUser } from "../../types/auth.types.ts";

type ControlsConstructor = (new () => GameControlsComponent) | (new () => GameControlsTournamentComponent);

interface GameComponentOptions {
    tournamentPlayers?: { player1: PublicUser; player2: PublicUser };
}

export class GameComponent extends BaseComponent {
    private canvas: HTMLCanvasElement;
    private game: PongGame;
    public gameControls: IGameControls;
    private playersDisplay: PlayersDisplay;

    private matchService: MatchService;
    private authService: AuthService;
    private currentGameMode: AiLevel = "none";
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
        this.container.appendChild(this.gameControls.getContainer());

        this.playersDisplay = new PlayersDisplay(this.canvas.width, this.options.tournamentPlayers);
        const playersDisplayContainer = this.container.querySelector("#players-display")!;
        playersDisplayContainer.appendChild(this.playersDisplay.getContainer());
    }

    private startCallback = (level?: AiLevel) => {
        this.game.destroy();
        const ctx = this.canvas.getContext("2d")!;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.currentGameMode = level || "none";

        if (!this.options.tournamentPlayers) {
            this.playersDisplay.updateGameMode(this.currentGameMode);
        }

        this.gameStartTime = Date.now();

        this.game = new PongGame(this.canvas, {}, this.onGameFinish);
        if (level !== undefined) {
            this.game.setAiLevel(level);
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

            const matchBody: MatchBody = {
                id: uuidv4(),
                player1Id: user!.id,
                player2Id: this.getPlayer2Name(),
                player1Score: result.player1Score,
                player2Score: result.player2Score,
                gameMode: this.getGameModeString(),
                duration,
            };

            await this.matchService.saveMatch(matchBody);
            console.log("Game result saved successfully");
        } catch (error) {
            console.error("Failed to save game result:", error);
        }
    }

    private getPlayer2Name(): string {
        switch (this.currentGameMode) {
            case "easy":
                return "aiEasy";
            case "hard":
                return "aiHard";
            default:
                return "unknown";
        }
    }

    private getGameModeString(): "pvp" | "ai-easy" | "ai-hard" {
        switch (this.currentGameMode) {
            case "easy":
                return "ai-easy";
            case "hard":
                return "ai-hard";
            default:
                return "pvp";
        }
    }

    destroy() {
        super.destroy();
        this.gameControls.removeFromStartCallbacks(this.startCallback);
        this.playersDisplay.destroy();
        this.game.destroy();
        document.getElementById("game-container")?.remove();
    }
}
