import { BaseComponent } from "../../BaseComponent.ts";
import { TournamentController } from "../../../controllers/tournament.controller.ts";
import leaderboardTemplate from "./leaderboard.html?raw";
import leaderboardEntryTemplate from "./leaderboardEntry.html?raw";
import type { User } from "../../../types/auth.types.ts";

export class Leaderboard extends BaseComponent {
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

	private fillLeaderboard() {
		const tournament = this.tournamentController.getTournament()!;

		const playerScores = new Map<string, { player: User; count: number }>();
		for (const player of tournament.players) {
			playerScores.set(player.id, { player: player, count: 0 });
		}

		for (const match of tournament.matches) {
			playerScores.get(match.player1.id)!.count += match.result.player1Score;
			playerScores.get(match.player2.id)!.count += match.result.player2Score;
		}

		const sorted = Array.from(playerScores.values()).sort((a, b) => b.count - a.count);

		sorted.forEach((entry, idx) => {
			let placeLabel: string;
			if (idx === 0) placeLabel = "1st place";
			else if (idx === 1) placeLabel = "2nd place";
			else if (idx === 2) placeLabel = "3rd place";
			else placeLabel = "";

			const html = leaderboardEntryTemplate
				.replace(/{{place}}/g, placeLabel)
				.replace(/{{playerName}}/g, entry.player.username);
			this.leaderboard.insertAdjacentHTML("beforeend", html)
		});
	}

	destroy(): void {
        super.destroy();
    }
}