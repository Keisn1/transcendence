import { BaseComponent } from "../../BaseComponent.ts";
import { GameComponent } from "../../gameComponent/gameComponent.ts";
import { GameControlsTournamentComponent } from "../../gameControls/gameControlsTournament/gameControlsTournament.ts";
import { TournamentController } from "../../../controllers/tournament.controller.ts";

export class TournamentMatchComponent extends BaseComponent {
    private gameComponent: GameComponent;
    private tournamentController: TournamentController;

    constructor() {
        super("div", "tournament-container");
        this.tournamentController = TournamentController.getInstance();
        this.gameComponent = new GameComponent(GameControlsTournamentComponent);
        this.container.appendChild(this.gameComponent.getContainer());

        this.gameComponent.gameControls.addToFinishCallbacks(() => {
            this.tournamentController.finishMatch(this.gameComponent!.getResult());
        });
    }
    destroy(): void {
        this.gameComponent.destroy();
        super.destroy();
    }
}
