import { BaseComponent } from "../BaseComponent.ts";
import { AuthService } from "../../services/auth/auth.service.ts";
import { MatchService } from "../../services/match/match.service.ts";
import matchHistoryTemplate from "./matchHistory.component.html?raw";
import type { GetMatchResponse } from "../../types/match.types.ts";
import { UserService } from "../../services/user/user.service.ts";

export class MatchHistoryComponent extends BaseComponent {
    private authService: AuthService;
    private matchService: MatchService;
    private userService: UserService;
    private userId?: string;

    private matchHistoryContent: HTMLElement;
    private opponentNameCache: Map<string, string>;

    constructor(userId?: string) {
        super("div", "match-history");
        this.userId = userId;

        this.authService = AuthService.getInstance();
        this.matchService = MatchService.getInstance();
        this.userService = UserService.getInstance();

        this.container.innerHTML = matchHistoryTemplate;

        this.matchHistoryContent = this.container.querySelector("#match-history-content")!;

        this.opponentNameCache = new Map<string, string>;

        this.loadMatchHistory();
    }

    private async loadMatchHistory() {
        try {
            const matches = this.userId
                ? await this.matchService.getMatchesByUser(this.userId)
                : await this.matchService.getUserMatches();

            await this.prefetchOpponentNames(matches);

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
            case "tournament":
                return "Tournament";
            default:
                return "Unknown";
        }
    }

    private getOpponentName(opponentId: string): string {
        if (opponentId === "00000000-0000-0000-0000-000000000000") return "Unknown";
        if (opponentId === "00000000-0000-0000-0000-000000000001") return "AI Easy";
        if (opponentId === "00000000-0000-0000-0000-000000000002") return "AI Hard";

        const opponentName = this.opponentNameCache.get(opponentId)!;
        return opponentName;
    }

    private showError(message: string) {
        this.matchHistoryContent.innerHTML = `
            <div class="text-center py-8">
                <p class="text-red-500">${message}</p>
            </div>
        `;
    }

    private async prefetchOpponentNames(matches: GetMatchResponse[]) {
        const ownerId = this.userId ?? this.authService.getCurrentUser()?.id;

        const opponentIds = new Array<string>;
        for (const m of matches) {
            const isPlayer1 = (m.player1Id == ownerId) ? true : false;
            const opponentId = isPlayer1 ? m.player2Id : m.player1Id;

            if (!opponentId) continue;
            
            if (!this.opponentNameCache.has(opponentId)) {
                opponentIds.push(opponentId);
            }
        }

        if (opponentIds.length === 0) return;

        for (const id of opponentIds) {
            try {
                const publicUser = await this.userService.getUserById(id);
                this.opponentNameCache.set(id, publicUser.username);
            } catch (e) {
                console.warn("Failed to fetch user", id, e);
                this.opponentNameCache.set(id, `Player ${id}`);
            }
        }
    }
}
