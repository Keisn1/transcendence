import { BaseComponent } from "../BaseComponent";
import playersDisplayTemplate from "./playersDisplay.html?raw";
import { AuthService } from "../../services/auth/auth.service";
import type { PublicUser } from "../../types/auth.types";
import type { GameMode } from "../../types/game.types";

export class PlayersDisplay extends BaseComponent {
    private authService: AuthService;
    private canvasWidth: number;

    constructor(canvasWidth: number, tournamentPlayers?: { player1: PublicUser; player2: PublicUser }) {
        super("div", "players-display", "mb-6");
        this.authService = AuthService.getInstance();
        this.canvasWidth = canvasWidth;

        if (tournamentPlayers) {
            this.renderTournament(tournamentPlayers);
        } else {
            this.render("pvp");
        }
    }

    private render(gameMode: GameMode) {
        const user = this.authService.getCurrentUser();
        const player2Content = this.getPlayer2Content(gameMode);

        this.container.innerHTML = playersDisplayTemplate
            .replace("{{canvasWidth}}", this.canvasWidth.toString())
            .replace("{{player1Name}}", user?.username || "Player 1")
            .replace("{{player1Avatar}}", user?.avatar || "/uploads/default-pfp.png")
            .replace("{{player2Content}}", player2Content);
    }

    private renderTournament(players: { player1: PublicUser; player2: PublicUser }) {
        const player2Content = `
            <img src="${players.player2.avatar}"
                 alt="${players.player2.username}"
                 class="w-12 h-12 rounded-full border-2 border-white">
            <span class="font-semibold text-lg">${players.player2.username}</span>
        `;

        this.container.innerHTML = playersDisplayTemplate
            .replace("{{canvasWidth}}", this.canvasWidth.toString())
            .replace("{{player1Name}}", players.player1.username)
            .replace("{{player1Avatar}}", players.player1.avatar)
            .replace("{{player2Content}}", player2Content);
    }

    private getPlayer2Content(gameMode: GameMode): string {
        if (gameMode === "pvp") {
            return `
                <div class="w-12 h-12 rounded-full bg-gray-500 border-2 border-white flex items-center justify-center">
                    <span class="text-white font-bold">P2</span>
                </div>
                <span class="font-semibold text-lg">Player 2</span>
            `;
        } else {
            const aiType = gameMode === "ai-easy" ? "AI Easy" : "AI Hard";
            return `
                <div class="w-12 h-12 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center">
                    <span class="text-white font-bold">AI</span>
                </div>
                <span class="font-semibold text-lg">${aiType}</span>
            `;
        }
    }

    public updateGameMode(gameMode: GameMode) {
        this.render(gameMode);
    }

    destroy(): void {
        super.destroy();
    }
}
