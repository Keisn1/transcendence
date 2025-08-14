import { BaseComponent } from "../../BaseComponent.ts";
import { TournamentController } from "../../../controllers/tournament.controller.ts";
import { UserController } from "../../../controllers/user.controller.ts";
import matchListTemplate from "./matchList.html?raw";
import matchTemplate from "./match.html?raw";

export class MatchList extends BaseComponent {
    private tournamentController: TournamentController;
    private matchList: HTMLUListElement;
    private defaultComponents: boolean = false;

    constructor(defaultComponents: boolean = false) {
        super("div", "match-list");
        console.log("constructing bracket component");
        this.tournamentController = TournamentController.getInstance();
        this.container.innerHTML = matchListTemplate;
        this.defaultComponents = defaultComponents;
        this.matchList = this.container.querySelector("#matches-list")!;

        this.populateData();

        this.addEventListenerWithCleanup(this.matchList, "click", this.onUserClick.bind(this));
    }
    private populateData() {
        if (this.defaultComponents) this.fillMatchListDefault();
        else this.fillMatchList();
    }

    private fillMatchList() {
        this.tournamentController.getTournament()!.matches.forEach((m) => {
            const status: string = `${m.result?.player1Score} : ${m.result?.player2Score}`;

            const player1Span = `<span class="cursor-pointer text-black underline-none hover:text-indigo-600" data-username="${m.player1.username}">${m.player1.username}</span>`;
            const player2Span = `<span class="cursor-pointer text-black underline-none hover:text-indigo-600" data-username="${m.player2.username}">${m.player2.username}</span>`;

            const html = matchTemplate
                .replace(/{{player1}}/g, player1Span)
                .replace(/{{player2}}/g, player2Span)
                .replace(/{{status}}/g, status);
            this.matchList.insertAdjacentHTML("beforeend", html);
        });
    }

    private fillMatchListDefault() {
        console.log("fill Macht list default");
        this.tournamentController.getTournamentDefault()!.matches.forEach((m) => {
            const status: string = `${m.result?.player1Score} : ${m.result?.player2Score}`;

            const player1Span = `<span class="cursor-pointer text-black underline-none hover:text-indigo-600" data-username="${m.player1.username}">${m.player1.username}</span>`;
            const player2Span = `<span class="cursor-pointer text-black underline-none hover:text-indigo-600" data-username="${m.player2.username}">${m.player2.username}</span>`;

            const html = matchTemplate
                .replace(/{{player1}}/g, player1Span)
                .replace(/{{player2}}/g, player2Span)
                .replace(/{{status}}/g, status);
            this.matchList.insertAdjacentHTML("beforeend", html);
        });
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
