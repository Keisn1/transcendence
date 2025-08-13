import { BaseComponent } from "../BaseComponent";
import profileStatsTemplate from "./profileStats.html?raw";
import { MatchService } from "../../services/match/match.service.ts";
import { AuthService } from "../../services/auth/auth.service.ts";
import { type GetMatchResponse } from "../../types/match.types";

type PlayerStats = {
	playerWinScore: number;
	playerLossScore: number;
};

export class ProfileStatsComponent extends BaseComponent {
	private authService: AuthService;
	private matchService: MatchService;
	private playerWinScoreContent!: HTMLSpanElement;
	private playerLossScoreContent!: HTMLSpanElement;
	private playerStats: PlayerStats = { playerWinScore: 0, playerLossScore: 0 };

	constructor() {
		super("div", "profile-stats-content");
		this.container.innerHTML = profileStatsTemplate;

		this.authService = AuthService.getInstance();
		this.matchService = MatchService.getInstance();

		this.playerWinScoreContent = this.container.querySelector<HTMLSpanElement>("#wins-value")!;
		this.playerLossScoreContent = this.container.querySelector<HTMLSpanElement>("#losses-value")!;

		this.loadMatchHistory();
	}

	private async loadMatchHistory() {
		try {
			const currentUserId = this.authService.getCurrentUser()?.id!;
			const matches = (await this.matchService.getMatchesByUser(currentUserId)) as GetMatchResponse[] || [];

			this.playerStats = this.extractStats(matches);
			this.render();
		} catch (error) {
			console.error("Failed to load match history:", error);
		}
	}

	private extractStats(matches: GetMatchResponse[]): PlayerStats {
		const stats: PlayerStats = { playerWinScore: 0, playerLossScore: 0 };
		const currentUser = this.authService.getCurrentUser();
		const currentUserId = currentUser?.id;

		if (!currentUserId) {
			return stats;
		}

		for (const m of matches) {
			let userScore: number | null = null;
			let opponentScore: number | null = null;

			if (m.player1Id === currentUserId) {
				userScore = m.player1Score;
				opponentScore = m.player2Score;
			} else if (m.player2Id === currentUserId) {
				userScore = m.player2Score;
				opponentScore = m.player1Score;
			} else {
				continue;
			}

			if (userScore == null || opponentScore == null) continue;

			userScore > opponentScore ? stats.playerWinScore++ : stats.playerLossScore++;
		}

		return stats;
	}

	private render() {
		if (this.playerWinScoreContent) {
			this.playerWinScoreContent.textContent = String(this.playerStats.playerWinScore);
		}
		if (this.playerLossScoreContent) {
			this.playerLossScoreContent.textContent = String(this.playerStats.playerLossScore);
		}
	}
}