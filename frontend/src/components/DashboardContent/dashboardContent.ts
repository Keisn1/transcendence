import { BaseComponent } from "../BaseComponent.ts";
import { AuthService } from "../../services/auth/auth.service.ts";
import { MatchService } from "../../services/match/match.service.ts";
import dashboardContentTemplate from "./dashboardContent.html?raw";
import type { GetMatchResponse } from "../../types/match.types.ts";

export class DashboardContent extends BaseComponent {
    private authService: AuthService;
    private matchService: MatchService;
    private userAvatar: HTMLImageElement;
    private userName: HTMLElement;
    private matchHistoryContent: HTMLElement;

    constructor() {
        super("div", "dashboard-content");
        this.authService = AuthService.getInstance();
        this.matchService = MatchService.getInstance();

        this.container.innerHTML = dashboardContentTemplate;

        this.userAvatar = this.container.querySelector("#user-avatar")!;
        this.userName = this.container.querySelector("#user-name")!;
        this.matchHistoryContent = this.container.querySelector("#match-history-content")!;

        this.loadUserInfo();
        this.loadMatchHistory();
    }

    private loadUserInfo() {
        const user = this.authService.getCurrentUser();
        if (user) {
            this.userAvatar.src = user.avatar;
            this.userName.textContent = user.username;
        }
    }

    private async loadMatchHistory() {
        try {
            const matches = await this.matchService.getUserMatches();
            this.renderMatches(matches);
        } catch (error) {
            console.error("Failed to load match history:", error);
            this.showError("Failed to load match history");
        }
    }

    private renderMatches(matches: GetMatchResponse[]) {
        if (matches.length === 0) {
            this.matchHistoryContent.innerHTML = `
                <div class="text-center py-8">
                    <p class="text-gray-500">No matches played yet</p>
                    <a href="/game" data-link class="mt-4 inline-block px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
                        Play Your First Game
                    </a>
                </div>
            `;
            return;
        }

        const matchesHtml = matches.map((match) => this.renderMatch(match)).join("");
        this.matchHistoryContent.innerHTML = `
            <div class="space-y-4">
                ${matchesHtml}
            </div>
        `;
    }

    private renderMatch(match: GetMatchResponse): string {
        const user = this.authService.getCurrentUser()!;
        const isPlayer1 = match.player1Id === user.id;
        const userScore = isPlayer1 ? match.player1Score : match.player2Score;
        const opponentScore = isPlayer1 ? match.player2Score : match.player1Score;
        const opponentId = isPlayer1 ? match.player2Id : match.player1Id;

        const won = userScore > opponentScore;
        const resultClass = won ? "text-green-600 bg-green-100" : "text-red-600 bg-red-100";
        const resultText = won ? "Won" : "Lost";

        const gameMode = this.getGameModeDisplay(match.gameMode);
        const date = new Date(match.created_at).toLocaleDateString();

        return `
            <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div class="flex items-center space-x-4">
                    <div class="flex-shrink-0">
                        <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${resultClass}">
                            ${resultText}
                        </span>
                    </div>
                    <div>
                        <div class="font-medium text-gray-900">
                            ${userScore} - ${opponentScore} vs ${this.getOpponentName(opponentId)}
                        </div>
                        <div class="text-sm text-gray-500">
                            ${gameMode} • ${date}
                        </div>
                    </div>
                </div>
                ${match.duration ? `<div class="text-sm text-gray-500">${Math.round(match.duration / 1000)}s</div>` : ""}
            </div>
        `;
    }

    private getGameModeDisplay(gameMode: string): string {
        switch (gameMode) {
            case "pvp":
                return "Player vs Player";
            case "ai-easy":
                return "AI Easy";
            case "ai-hard":
                return "AI Hard";
            default:
                return "Unknown";
        }
    }

    private getOpponentName(opponentId: string): string {
        // For AI opponents
        if (opponentId === "aiEasy") return "AI Easy";
        if (opponentId === "aiHard") return "AI Hard";

        // For real players, you might want to fetch their names
        // For now, just show the ID
        return `Player ${opponentId.substring(0, 8)}...`;
    }

    private showError(message: string) {
        this.matchHistoryContent.innerHTML = `
            <div class="text-center py-8">
                <p class="text-red-500">${message}</p>
            </div>
        `;
    }

    destroy(): void {
        super.destroy();
    }
}
