import { BaseComponent } from "../../BaseComponent.ts";
import nextMatchTemplate from "./nextMatch.html?raw";
import { TournamentState } from "../../../controllers/tournament.machine.ts";
import { TournamentController } from "../../../controllers/tournament.controller.ts";

export class NextMatch extends BaseComponent {
    private tournamentController: TournamentController;
    private nextMatchDetails: HTMLElement;
    private startBtn: HTMLButtonElement;

    constructor() {
        super("div", "next-match-container");
        console.log("constructing bracket component");
        this.container.innerHTML = nextMatchTemplate;
        this.tournamentController = TournamentController.getInstance();

        this.nextMatchDetails = this.container.querySelector("#next-match-details")!;
        this.startBtn = this.container.querySelector("#start-match-btn")!;
        this.startBtn.onclick = () => {
            this.tournamentController.startMatch();
        };

        this.populateData();
    }
    private populateData() {
        this.fillNextMatchDetails();
    }

    private fillNextMatchDetails() {
        switch (this.tournamentController.getTournamentMachine()!.getState()) {
            case TournamentState.READY:
                this.nextMatchDetails.textContent = `Playing: ${this.nextMatchLabel()}`;
                break;
            case TournamentState.IN_PROGRESS:
                this.nextMatchDetails.textContent = `Playing: ${this.nextMatchLabel()}`;
                break;
            case TournamentState.MATCH_DONE:
                this.nextMatchDetails.textContent = "Last result recorded";
                break;
            case TournamentState.COMPLETED:
                this.nextMatchDetails.textContent = "Tournament Complete!";
                break;
        }
    }

    private nextMatchLabel() {
        // TODO: bit strange, maybe a method on the tournament itself
        // const next = this.tournamentController.getTournament()!.matches.find((m) => !m.result)!;
        // return `${next.player1.username} vs ${next.player2.username ?? "BYE"}`;

        const tournament = this.tournamentController.getTournament();
		const nextMatch = tournament.matches[tournament.nextMatchIdx];
        return `${nextMatch.player1.username} vs ${nextMatch.player2.username ?? "BYE"}`;
    }

    destroy(): void {
        super.destroy();
    }
}
