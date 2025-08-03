import { BaseComponent } from "../../BaseComponent.ts";
import { GameComponent } from "../../gameComponent/gameComponent.ts";
import { GameControlsTournamentComponent } from "../../gameControls/gameControlsTournament/gameControlsTournament.ts";
import { TournamentController } from "../../../controllers/tournament.controller.ts";
import { ExitBtn } from "../exitButton/exitBtn.ts";

export class TournamentMatchComponent extends BaseComponent {
    private gameComponent: GameComponent;
    private tournamentController: TournamentController;
    private exitBtn: ExitBtn;

    constructor() {
        super("div", "tournament-container");
        this.tournamentController = TournamentController.getInstance();
        this.gameComponent = new GameComponent(GameControlsTournamentComponent);
        this.exitBtn = new ExitBtn();

        this.container.appendChild(this.gameComponent.getContainer());
        this.container.appendChild(this.exitBtn.getContainer());

        this.gameComponent.gameControls.addToFinishCallbacks(() => {
            this.tournamentController.finishMatch(this.gameComponent!.getResult());
        });
    }
    destroy(): void {
        this.gameComponent.destroy();
        this.exitBtn.destroy();
        super.destroy();
    }
}
