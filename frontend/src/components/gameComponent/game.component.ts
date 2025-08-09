import gameTemplate from "./game.html?raw";
import { PongGame } from "../../game/game";
import { BaseComponent } from "../BaseComponent";
import { type AiLevel } from "../../game/game";
import { type MatchResult } from "../../types/tournament.types";
import { GameControlsComponent } from "../gameControls/gameControlsGame/gameControls";
import { GameControlsTournamentComponent } from "../gameControls/gameControlsTournament/gameControlsTournament";
import type IGameControls from "../gameControls/IGameControls";
import { MatchService } from "../../services/match/match.service";
import { AuthService } from "../../services/auth/auth.service";

type ControlsConstructor = (new () => GameControlsComponent) | (new () => GameControlsTournamentComponent);

export class GameComponent extends BaseComponent {
    private canvas: HTMLCanvasElement;
    private game: PongGame;
    public gameControls: IGameControls;

    private gameService: MatchService;
    private authService: AuthService;
    private currentGameMode: AiLevel = "none";
    private gameStartTime: number = 0;

    constructor(ControlsClass: ControlsConstructor) {
        super("div", "game-container");

        this.container.innerHTML = gameTemplate;
        this.canvas = this.container.querySelector("#canvas")!;
        this.game = new PongGame(this.canvas);

        this.gameService = MatchService.getInstance();
        this.authService = AuthService.getInstance();

        this.gameControls = new ControlsClass() as IGameControls;
        this.gameControls.addToStartCallbacks(this.startCallback);
        this.container.appendChild(this.gameControls.getContainer());

        this.setupPlayersDisplay();
    }

    private setupPlayersDisplay() {
        console.log("setting up player display");
        const playersDisplay = this.container.querySelector("#players-display")!;

        if (!playersDisplay) {
            console.error("Players display element not found");
            return;
        }
        const user = this.authService.getCurrentUser();

        const canvasWidth = this.canvas.width;

        playersDisplay.innerHTML = `
            <div class="flex items-center justify-between" style="width: ${canvasWidth}px;">
                <div class="flex items-center space-x-3">
                    <span class="font-semibold text-lg">${user?.username || "Player 1"}</span>
                    <img src="${user?.avatar || "/default-avatar.png"}"
                         alt="${user?.username}"
                         class="w-12 h-12 rounded-full border-2 border-white">
                </div>
                <div class="font-bold text-xl absolute left-1/2 transform -translate-x-1/2">VS</div>
                <div id="player2-info" class="flex items-center space-x-3">
                    <img class="w-12 h-12 rounded-full border-2 border-white" />
                    <span class="font-semibold text-lg">Player 2</span>
                </div>
            </div>
        `;
    }

    private updatePlayer2Display(gameMode: AiLevel) {
        const player2Info = this.container.querySelector("#player2-info")!;

        if (gameMode === "none") {
            player2Info.innerHTML = `
                <div class="w-12 h-12 rounded-full bg-gray-500 border-2 border-white flex items-center justify-center">
                    <span class="text-white font-bold">P2</span>
                </div>
                <span class="font-semibold text-lg">Player 2</span>
            `;
        } else {
            const aiType = gameMode === "easy" ? "AI Easy" : "AI Hard";
            player2Info.innerHTML = `
                <div class="w-12 h-12 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center">
                    <span class="text-white font-bold">AI</span>
                </div>
                <span class="font-semibold text-lg">${aiType}</span>
            `;
        }
    }

    private startCallback = (level?: AiLevel) => {
        this.game.destroy();
        const ctx = this.canvas.getContext("2d")!;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.currentGameMode = level || "none";
        this.updatePlayer2Display(this.currentGameMode);
        this.gameStartTime = Date.now();

        // Pass the finish callback to toggle the button
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
        await this.registerGameResult();
    };

    private async registerGameResult() {
        try {
            const result = this.getResult();
            const user = this.authService.getCurrentUser();
            const duration = Date.now() - this.gameStartTime;

            const gameResultBody = {
                player1Id: user?.username || "Player 1",
                player2Id: this.getPlayer2Name(),
                player1Score: result.player1Score,
                player2Score: result.player2Score,
                gameMode: this.getGameModeString(),
                duration,
            };

            await this.gameService.saveMatch(gameResultBody);
            console.log("Game result saved successfully");
        } catch (error) {
            console.error("Failed to save game result:", error);
        }
    }

    private getPlayer2Name(): string {
        switch (this.currentGameMode) {
            case "easy":
                return "AI Easy";
            case "hard":
                return "AI Hard";
            default:
                return "Player 2";
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
        this.game.destroy();
        document.getElementById("game-container")?.remove();
    }
}
