import { BaseComponent } from "../../BaseComponent";
import playerNamesDisplayTemplate from "./playerNamesDisplay.html?raw";
import { TournamentController } from "../../../controllers/tournament.controller.ts";

export class PlayerNamesDisplay extends BaseComponent {
    private tournamentController: TournamentController;

	constructor() {
		super("div", "player-names-display-container");
		console.log("constructing player-names-display-container component");
		this.tournamentController = TournamentController.getInstance();
		const tournament = this.tournamentController.getTournament();
		const match = tournament.matches[tournament.nextMatchIdx];
		this.container.innerHTML = playerNamesDisplayTemplate
			.replace(/{{player1}}/g, match.player1.username)
            .replace(/{{player2}}/g, match.player2.username);
	}

	destroy(): void {
        super.destroy();
    }
}