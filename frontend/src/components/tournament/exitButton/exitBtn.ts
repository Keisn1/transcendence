import { BaseComponent } from "../../BaseComponent.ts";
import buttonTemplate from "./exitBtn.html?raw";
import { TournamentController } from "../../../controllers/tournament.controller.ts";

export class ExitBtn extends BaseComponent {
    private tournamentController: TournamentController;
    private exitBtn: HTMLButtonElement;

    constructor() {
        super("div", "exit-button-container");
        console.log("constructing exit button component");
        this.container.innerHTML = buttonTemplate;
        this.exitBtn = this.container.querySelector("#exit-btn")!;
        this.tournamentController = TournamentController.getInstance();

        this.exitBtn.onclick = () => {
            this.tournamentController.exitTournament();
        };
    }

    destroy(): void {
        super.destroy();
    }
}
