import { BaseComponent } from "../../BaseComponent.ts";
import { TournamentController } from "../../../controllers/tournament.controller.ts";
import matchListTemplate from "./matchList.html?raw";
import matchTemplate from "./match.html?raw";

export class MatchList extends BaseComponent {
    private tournamentController: TournamentController;
    private matchList: HTMLUListElement;

    constructor() {
        super("div", "match-list");
        console.log("constructing bracket component");
        this.tournamentController = TournamentController.getInstance();
        this.container.innerHTML = matchListTemplate;
        this.matchList = this.container.querySelector("#matches-list")!;

        this.populateData();
    }
    private populateData() {
        this.fillMatchList();
    }

    private fillMatchList() {
        this.tournamentController.getTournament()!.matches.forEach((m) => {
            const status: string = `${m.result?.player1Score} : ${m.result?.player2Score}`;
            const html = matchTemplate
                .replace(/{{player1}}/g, m.player1.username)
                .replace(/{{player2}}/g, m.player2.username)
                .replace(/{{status}}/g, status);
            this.matchList.insertAdjacentHTML("beforeend", html);
        });
    }

    destroy(): void {
        super.destroy();
    }
}
