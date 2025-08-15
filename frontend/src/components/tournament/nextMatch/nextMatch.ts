import { BaseComponent } from "../../BaseComponent.ts";
import nextMatchTemplate from "./nextMatch.html?raw";
import { TournamentMachine, TournamentState } from "../../../controllers/tournament.machine.ts";
import { Tournament, TournamentController } from "../../../controllers/tournament.controller.ts";
import { UserController } from "../../../controllers/user.controller.ts";

const ZERO_UUID = "00000000-0000-0000-0000-000000000000";

export class NextMatch extends BaseComponent {
    private tournamentController: TournamentController;
    private nextMatchDetails: HTMLElement;
    private startBtn: HTMLButtonElement;
    private defaultComponents: boolean;
    private tournament: Tournament;
    private tournamentMachine: TournamentMachine;

    constructor(defaultComponents: boolean = false) {
        super("div", "next-match-container");
        this.defaultComponents = defaultComponents;
        this.container.innerHTML = nextMatchTemplate;
        this.tournamentController = TournamentController.getInstance();

        if (this.defaultComponents) {
            this.tournament = this.tournamentController.getTournamentDefault();
            this.tournamentMachine = this.tournamentController.getTournamentMachineDefault();
        } else {
            this.tournament = this.tournamentController.getTournament();
            this.tournamentMachine = this.tournamentController.getTournamentMachine();
        }

        this.nextMatchDetails = this.container.querySelector("#next-match-details")!;
        this.startBtn = this.container.querySelector("#start-match-btn")!;
        this.startBtn.onclick = () => {
            if (defaultComponents) this.tournamentController.startMatchDefault();
            else this.tournamentController.startMatch();
        };

        this.populateData();
    }
    private populateData() {
        this.fillNextMatchDetails();
    }

    private fillNextMatchDetails() {
        const nextMatch = this.tournament.matches[this.tournament.nextMatchIdx];
        const player1Span = (nextMatch.player1.id && nextMatch.player1.id !== ZERO_UUID)
            ? `<span class="cursor-pointer font-medium text-black underline-none hover:text-indigo-600" data-username="${nextMatch.player1.username}">${nextMatch.player1.username}</span>`
            : `<span class="font-medium text-black underline-none">${nextMatch.player1.username}</span>`
        const player2Span = (nextMatch.player2.id && nextMatch.player2.id !== ZERO_UUID)
            ? `<span class="cursor-pointer font-medium text-black underline-none hover:text-indigo-600" data-username="${nextMatch.player2.username}">${nextMatch.player2.username}</span>`
            : `<span class="font-medium text-black underline-none">${nextMatch.player2.username}</span>`

        let text = "";
        switch (this.tournamentMachine.getState()) {
            case TournamentState.READY: // TODO: erik: this case doesn't look right, possibly can be removed
                text = `Playing: ${player1Span} vs ${player2Span}`;
                break;
            case TournamentState.IN_PROGRESS:
                text = `Playing: ${player1Span} vs ${player2Span}`;
                break;
            case TournamentState.MATCH_DONE:
                text = "Last result recorded";
                break;
            case TournamentState.COMPLETED:
                text = "Tournament Complete!";
                break;
        }

        this.nextMatchDetails.innerHTML = text;

        this.addEventListenerWithCleanup(this.nextMatchDetails, "click", this.onUserClick.bind(this));
    }

    private onUserClick(e: Event) {
        e.preventDefault();

        const target = e.target as HTMLElement;

        const username = target.dataset.username;
        if (!username) return;

        UserController.getInstance().navigateToUser(`/user/${encodeURIComponent(username)}`);
    }

    destroy(): void {
        super.destroy();
    }
}
