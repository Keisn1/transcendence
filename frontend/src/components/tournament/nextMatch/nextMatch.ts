import { BaseComponent } from "../../BaseComponent.ts";
import nextMatchTemplate from "./nextMatch.html?raw";
import { TournamentState } from "../../../controllers/tournament.machine.ts";
import { TournamentController } from "../../../controllers/tournament.controller.ts";
import { UserController } from "../../../controllers/user.controller.ts";

export class NextMatch extends BaseComponent {
    private tournamentController: TournamentController;
    // private userController: UserController;
    private nextMatchDetails: HTMLElement;
    private startBtn: HTMLButtonElement;

    constructor() {
        super("div", "next-match-container");
        console.log("constructing bracket component");
        this.container.innerHTML = nextMatchTemplate;
        this.tournamentController = TournamentController.getInstance();
        // this.userController = UserController.getInstance();

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
        const tournament = this.tournamentController.getTournament();
        const nextMatch = tournament.matches[tournament.nextMatchIdx];

        const player1Span = `<span class="cursor-pointer text-black underline-none hover:text-indigo-600" data-username="${nextMatch.player1.username}">${nextMatch.player1.username}</span>`;
        const player2Span = `<span class="cursor-pointer text-black underline-none hover:text-indigo-600" data-username="${nextMatch.player2.username}">${nextMatch.player2.username}</span>`;

        let text = "";
        switch (this.tournamentController.getTournamentMachine()!.getState()) {
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

        const username = target.dataset.userId;
        if (!username) return;

        UserController.getInstance().navigateToUser(`/user/${encodeURIComponent(username)}`);
    }

    destroy(): void {
        super.destroy();
    }
}
