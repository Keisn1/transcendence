import { BaseComponent } from "../BaseComponent.ts";
import type { Tournament, Match } from "../../types/tournament.types.ts";
import { GameComponent } from "../gameComponent/gameComponent.ts";
import { GameControlsTournamentComponent } from "../gameControls/gameControlsTournament/gameControlsTournament.ts";
import { TournamentController } from "../../controllers/tournament.controller.ts";

export class TournamentMatchComponent extends BaseComponent {
    private gameComponent: GameComponent;
    private tournamentController: TournamentController;
    private tournament: Tournament;

    constructor() {
        super("div", "tournament-container");
        this.tournamentController = TournamentController.getInstance();
        this.tournament = this.tournamentController.getTournament()!;

        this.gameComponent = new GameComponent(GameControlsTournamentComponent);
        this.container.appendChild(this.gameComponent.getContainer());

        this.gameComponent.gameControls.addToFinishCallbacks(() => {
            const result = this.gameComponent!.getResult();
            const matchIndex = this.tournament.matches.findIndex((m: Match) => !m.result)!;
            this.tournament.matches[matchIndex].result = result;

            console.log(result);
            console.log(this.tournament.matches[matchIndex].result);

            this.tournamentController.finishMatch(result);
        });
    }
    destroy(): void {
        this.gameComponent.destroy();
        super.destroy();
    }
}
