import { BaseComponent } from "../BaseComponent.ts";
import { AuthService } from "../../services/auth/auth.service.ts";
import { MatchService } from "../../services/match/match.service.ts";
import matchHistoryTemplate from "./matchHistory.component.html?raw";
import type { GetMatchResponse } from "../../types/match.types.ts";
import { UserService } from "../../services/user/user.service.ts";
import { UserController } from "../../controllers/user.controller.ts";

export class MatchHistoryComponent extends BaseComponent {
    private authService: AuthService;
    private matchService: MatchService;
    private userService: UserService;
    private userId?: string;
    private username?: string;

    private matchHistoryContent: HTMLElement;
    private opponentNameCache: Map<string, string>;

    constructor(username?: string) {
        super("div", "match-history");

        this.authService = AuthService.getInstance();
        this.matchService = MatchService.getInstance();
        this.userService = UserService.getInstance();

        this.container.innerHTML = matchHistoryTemplate;

        this.matchHistoryContent = this.container.querySelector("#match-history-content")!;

        this.opponentNameCache = new Map<string, string>();

        if (username) this.username = username;
        else this.username = this.authService.getCurrentUser()?.username;

        this.addEventListenerWithCleanup(this.matchHistoryContent, "click", this.onUserClick.bind(this));

        // this.loadMatchHistory();
    }

    static async create(username?: string): Promise<MatchHistoryComponent> {
        const component = new MatchHistoryComponent(username);
        await component.loadMatchHistory();
        return component;
    }

    private async loadMatchHistory() {
        try {
            this.userId = (await this.userService.getUserByUsername(this.username!)).id;
            // Only proceed if we have userId
            if (!this.userId) {
                throw new Error("Could not find user");
            }

            const matches = await this.matchService.getMatchesByUser(this.userId!);

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
        const isPlayer1 = match.player1Id === this.userId;
        const userScore = isPlayer1 ? match.player1Score : match.player2Score;
        const opponentScore = isPlayer1 ? match.player2Score : match.player1Score;
        const opponentId = isPlayer1 ? match.player2Id : match.player1Id;

        const won = userScore > opponentScore;
        const resultClass = won ? "text-green-600 bg-green-100" : "text-red-600 bg-red-100";
        const resultText = won ? "Won" : "Lost";

        const gameMode = this.getGameModeDisplay(match.gameMode);
        const date = new Date(match.created_at).toLocaleDateString();

        const opponentName = this.getOpponentName(opponentId);
        const opponentHtml = this.isLinkable(opponentId)
            ? `<a href="" data-user-name="${opponentName}" class="text-indigo-600 hover:underline">${opponentName}</a>`
            : opponentName;

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
                            ${userScore} - ${opponentScore} vs ${opponentHtml}
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

        const opponentName = this.opponentNameCache.get(opponentId) ?? "Unknown";
        return opponentName;
    }

    private isLinkable(opponentId: string | undefined): boolean {
        if (!opponentId) return false;
        if (
            opponentId === "00000000-0000-0000-0000-000000000000" ||
            opponentId === "00000000-0000-0000-0000-000000000001" ||
            opponentId === "00000000-0000-0000-0000-000000000002"
        ) {
            return false;
        }
        return true;
    }

    private onUserClick(e: Event) {
        e.preventDefault();

        const target = e.target as HTMLElement;

        const username = target.dataset.userName;
        console.log(target.dataset);
        if (!username) return;

        UserController.getInstance().navigateToUser(`/user/${encodeURIComponent(username)}`);
    }

    private showError(message: string) {
        this.matchHistoryContent.innerHTML = `
            <div class="text-center py-8">
                <p class="text-red-500">${message}</p>
            </div>
        `;
    }

    private async prefetchOpponentNames(matches: GetMatchResponse[]) {
        const opponentIds = new Array<string>();

        // making array of all opponent ids
        opponentIds.push(this.userId!);
        for (const m of matches) {
            const isPlayer1 = m.player1Id == this.userId ? true : false;
            const opponentId = isPlayer1 ? m.player2Id : m.player1Id;

            if (!opponentId) continue;

            if (!this.opponentNameCache.has(opponentId)) {
                opponentIds.push(opponentId);
            }
        }

        if (opponentIds.length === 0) return;

        // filling opponentNameCache with ids and names
        for (const id of opponentIds) {
            try {
                const publicUser = await this.userService.getUserById(id);
                this.opponentNameCache.set(id, publicUser.username);
            } catch (e) {
                console.warn("Failed to fetch user", id, e);
                this.opponentNameCache.set(id, "Unknown");
            }
        }
    }
}
