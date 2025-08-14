import { BaseComponent } from "../../BaseComponent.ts";
import { TournamentController } from "../../../controllers/tournament.controller.ts";
import leaderboardTemplate from "./leaderboardDefault.html?raw";
import leaderboardEntryTemplate from "./leaderboardEntry.html?raw";
import type { PublicUser } from "../../../types/auth.types.ts";

export class LeaderboardDefault extends BaseComponent {
    private tournamentController: TournamentController;
    private leaderboard: HTMLUListElement;

    constructor() {
        super("div", "match-list");
        console.log("constructing leaderboard component");
        this.tournamentController = TournamentController.getInstance();
        this.container.innerHTML = leaderboardTemplate;
        this.leaderboard = this.container.querySelector("#leaderboard")!;

        this.fillLeaderboard();
    }

    private getPlayerScores(): { player: PublicUser; count: number }[] {
        const tournament = this.tournamentController.getTournament()!;

        const playerScores = new Map<string, { player: PublicUser; count: number }>();

        for (const player of tournament.players) {
            playerScores.set(player.username, { player: player, count: 0 });
        }

        for (const match of tournament.matches) {
            playerScores.get(match.player1.username)!.count += match.result.player1Score;
            playerScores.get(match.player2.username)!.count += match.result.player2Score;
        }

        const sorted = Array.from(playerScores.values()).sort((a, b) => b.count - a.count);

        return sorted;
    }

    private fillLeaderboard() {
        const playerScores = this.getPlayerScores();

        playerScores.forEach((entry, idx) => {
            const placeLabel = `${this.toOrdinalNumber(idx + 1)} place`;

            const html = leaderboardEntryTemplate
                .replace(/{{place}}/g, placeLabel)
                .replace(/{{playerName}}/g, entry.player.username)
                .replace(/{{score}}/g, entry.count.toString());
            this.leaderboard.insertAdjacentHTML("beforeend", html);
        });
    }

    private toOrdinalNumber(n: number): string {
        if (n % 10 === 1 && n % 100 !== 11) return `${n}st`;
        if (n % 10 === 2 && n % 100 !== 12) return `${n}nd`;
        if (n % 10 === 3 && n % 100 !== 13) return `${n}rd`;
        return `${n}th`;
    }

    destroy(): void {
        super.destroy();
    }
}
