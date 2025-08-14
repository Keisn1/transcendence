import { BaseComponent } from "../../BaseComponent.ts";
import { GameComponent } from "../../gameComponent/game.component.ts";
import { GameControlsTournamentComponent } from "../../gameControls/gameControlsTournament/gameControlsTournament.ts";
import { TournamentController } from "../../../controllers/tournament.controller.ts";
import { ExitBtn } from "../exitButton/exitBtn.ts";

export class TournamentMatchComponent extends BaseComponent {
    private gameComponent: GameComponent;
    private tournamentController: TournamentController;
    private exitBtn: ExitBtn;

    constructor(withRegistration: boolean = true) {
        super("div", "tournament-container");
        this.tournamentController = TournamentController.getInstance();

        // Get current match players
        const tournament = this.tournamentController.getTournament();
        const currentMatch = tournament.matches[tournament.nextMatchIdx];

        this.gameComponent = new GameComponent(GameControlsTournamentComponent, {
            tournamentPlayers: {
                player1: currentMatch.player1,
                player2: currentMatch.player2,
            },
            tournamentId: tournament.id,
        });

        this.exitBtn = new ExitBtn(withRegistration);

        this.container.appendChild(this.gameComponent.getContainer());
        this.container.appendChild(this.exitBtn.getContainer());

        this.gameComponent.gameControls.addToFinishCallbacks(() => {
            if (withRegistration) {
                this.tournamentController.finishMatch(this.gameComponent!.getResult());
            } else {
                this.tournamentController.finishMatchDefault(this.gameComponent!.getResult());
            }
        });
    }
    destroy(): void {
        this.gameComponent.destroy();
        this.exitBtn.destroy();
        super.destroy();
    }
}
