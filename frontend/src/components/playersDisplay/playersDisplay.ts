import { BaseComponent } from "../BaseComponent";
import playersDisplayTemplate from "./playersDisplay.html?raw";
import { AuthService } from "../../services/auth/auth.service";
import { type AiLevel } from "../../game/game";

export class PlayersDisplay extends BaseComponent {
    private authService: AuthService;
    private canvasWidth: number;

    constructor(canvasWidth: number) {
        super("div", "players-display", "mb-6");
        this.authService = AuthService.getInstance();
        this.canvasWidth = canvasWidth;

        this.render("none");
    }

    private render(gameMode: AiLevel) {
        const user = this.authService.getCurrentUser();
        const player2Content = this.getPlayer2Content(gameMode);

        this.container.innerHTML = playersDisplayTemplate
            .replace("{{canvasWidth}}", this.canvasWidth.toString())
            .replace("{{player1Name}}", user?.username || "Player 1")
            .replace("{{player1Avatar}}", user?.avatar || "/uploads/default-pfp.png")
            .replace("{{player2Content}}", player2Content);
    }

    private getPlayer2Content(gameMode: AiLevel): string {
        if (gameMode === "none") {
            return `
                <div class="w-12 h-12 rounded-full bg-gray-500 border-2 border-white flex items-center justify-center">
                    <span class="text-white font-bold">P2</span>
                </div>
                <span class="font-semibold text-lg">Player 2</span>
            `;
        } else {
            const aiType = gameMode === "easy" ? "AI Easy" : "AI Hard";
            return `
                <div class="w-12 h-12 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center">
                    <span class="text-white font-bold">AI</span>
                </div>
                <span class="font-semibold text-lg">${aiType}</span>
            `;
        }
    }

    public updateGameMode(gameMode: AiLevel) {
        this.render(gameMode);
    }

    destroy(): void {
        super.destroy();
    }
}
