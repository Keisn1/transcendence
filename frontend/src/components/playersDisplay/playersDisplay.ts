import { BaseComponent } from "../BaseComponent";
import playersDisplayTemplate from "./playersDisplay.html?raw";
import { AuthService } from "../../services/auth/auth.service";
import type { PublicUser } from "../../types/auth.types";
import type { GameMode } from "../../types/game.types";

const ZERO_UUID = "00000000-0000-0000-0000-000000000000";

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

        this.addEventListenerWithCleanup(this.container, "click", this.onUserClick.bind(this));
    }

    private render(gameMode: GameMode) {
        const user = this.authService.getCurrentUser();
        const player2Content = this.getPlayer2Content(gameMode);

        const player1Span = user?.username
            ? (user.id && user.id !== ZERO_UUID
                ? `<span class="cursor-pointer text-black underline-none hover:text-indigo-600" data-username="${user.username}">${user.username}</span>`
                : user.username)
            : "Player 1";

        this.container.innerHTML = playersDisplayTemplate
            .replace("{{canvasWidth}}", this.canvasWidth.toString())
            .replace("{{player1Name}}", player1Span)
            .replace("{{player1Avatar}}", user?.avatar || "/uploads/default-pfp.png")
            .replace("{{player2Content}}", player2Content);
    }

    private renderTournament(players: { player1: PublicUser; player2: PublicUser }) {
        const player1Span = (players.player1.id && players.player1.id !== ZERO_UUID)
            ? `<span class="cursor-pointer text-black underline-none hover:text-indigo-600" data-username="${players.player1.username}">${players.player1.username}</span>`
            : players.player1.username;

        const player2Span = (players.player2.id && players.player2.id !== ZERO_UUID)
            ? `<span class="cursor-pointer text-black underline-none hover:text-indigo-600" data-username="${players.player2.username}">${players.player2.username}</span>`
            : players.player2.username;

        const player2Content = `
            <img src="${players.player2.avatar}"
                 alt="${players.player2.username}"
                 class="w-12 h-12 rounded-full border-2 border-white">
            <span class="font-semibold text-lg">${player2Span}</span>
        `;

        this.container.innerHTML = playersDisplayTemplate
            .replace("{{canvasWidth}}", this.canvasWidth.toString())
            .replace("{{player1Name}}", player1Span)
            .replace("{{player1Avatar}}", players.player1.avatar)
            .replace("{{player2Content}}", player2Content);
    }

    private getPlayer2Content(gameMode: GameMode): string {
        if (gameMode === "pvp") {
            return `
                <img src="/uploads/default-pfp.png"
                    alt="Player 2"
                    class="w-12 h-12 rounded-full border-2 border-white">
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

    private onUserClick(e: Event) {
        e.preventDefault();
        const target = e.target as HTMLElement;
        const username = target.dataset.username;
        if (!username) return;

        // window.open(`/user/${encodeURIComponent(username)}`, '_self');
        window.open(`/user/${encodeURIComponent(username)}`, '_blank');
        return;
    }

    destroy(): void {
        super.destroy();
    }
}
