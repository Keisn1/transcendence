import { BaseComponent } from "../BaseComponent.ts";
import tournamentBracketTemplate from "./tournamentBracket.html?raw";
import matchTemplate from "./match.html?raw";
import { TournamentState } from "../../controllers/tournament.machine.ts";
import { TournamentController } from "../../controllers/tournament.controller.ts";

export class TournamentBracketComponent extends BaseComponent {
    private tournamentController: TournamentController;
    private matchList: HTMLUListElement;
    private nextMatchDetails: HTMLElement;
    private startBtn: HTMLButtonElement;

    constructor() {
        super("div", "tournament-container");
        console.log("constructing bracket component");
        this.container.innerHTML = tournamentBracketTemplate;
        this.tournamentController = TournamentController.getInstance();

        this.matchList = this.container.querySelector("#matches-list")!;
        this.nextMatchDetails = this.container.querySelector("#next-match-details")!;
        this.startBtn = this.container.querySelector("#start-match-btn")!;

        this.startBtn.onclick = () => {
            this.tournamentController.startMatch();
        };

        this.populateData();
    }
    private populateData() {
        this.fillMatchList();
        this.fillNextMatchDetails();
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
    private fillNextMatchDetails() {
        switch (this.tournamentController.getTournamentMachine()!.getState()) {
            case TournamentState.READY:
                this.nextMatchDetails.textContent = "Ready to start first match";
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
        const next = this.tournamentController.getTournament()!.matches.find((m) => !m.result)!;
        return `${next.player1.username} vs ${next.player2.username ?? "BYE"}`;
    }

    destroy(): void {
        super.destroy();
    }
}
