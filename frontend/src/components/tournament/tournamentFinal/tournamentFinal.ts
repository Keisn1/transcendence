import { BaseComponent } from "../../BaseComponent.ts";
import { TournamentHeader } from "../tournamentHeader/tournamentHeader.ts";
import { MatchList } from "../matchList/matchList.ts";
import { Leaderboard } from "../leaderboard/leaderboard.ts";
import { ExitBtn } from "../exitButton/exitBtn.ts";


export class TournamentFinalComponent extends BaseComponent {
    private header: TournamentHeader;
    private leaderboard: Leaderboard;
    private matchList: MatchList;
    private exitBtn: ExitBtn;

    constructor() {
        super("div", "tournament-container", "mt-8 sm:mx-auto sm:w-full sm:max-w-2xl");
        console.log("constructing bracket component");
        this.header = new TournamentHeader();
        this.leaderboard = new Leaderboard();
        this.matchList = new MatchList();
        this.exitBtn = new ExitBtn();

        this.container.appendChild(this.header.getContainer());
        this.container.appendChild(this.leaderboard.getContainer());
        this.container.appendChild(this.matchList.getContainer());
        this.container.appendChild(this.exitBtn.getContainer());
    }

    destroy(): void {
        this.header.destroy();
        this.leaderboard.destroy();
        this.matchList.destroy();
        this.exitBtn.destroy();
        super.destroy();
    }
}
