import { BaseComponent } from "../../BaseComponent.ts";
import { TournamentHeader } from "../tournamentHeader/tournamentHeader.ts";
import { MatchList } from "../matchList/matchList.ts";
import { Leaderboard } from "../leaderboard/leaderboard.ts";
import { LeaderboardDefault } from "../leaderboardDefault/leaderboardDefault.ts";
import { ExitBtn } from "../exitButton/exitBtn.ts";

export class TournamentFinalComponent extends BaseComponent {
    private header: TournamentHeader;
    private leaderboard: Leaderboard | null = null;
    private leaderboardDefault: LeaderboardDefault | null = null;
    private matchList: MatchList;
    private exitBtn: ExitBtn;

    constructor(withRegistration: boolean = false) {
        super("div", "tournament-container", "mt-8 sm:mx-auto sm:w-full sm:max-w-2xl");
        console.log("constructing bracket component");
        const title = "Tournament Results";
        const description = "View the current tournament leaderboard and review every match outcome.";
        this.header = new TournamentHeader(title, description);

        if (withRegistration) this.leaderboard = new Leaderboard();
        else this.leaderboardDefault = new LeaderboardDefault();

        this.matchList = new MatchList();
        this.exitBtn = new ExitBtn();

        this.container.appendChild(this.header.getContainer());
        if (this.leaderboard) this.container.appendChild(this.leaderboard.getContainer());
        if (this.leaderboardDefault) this.container.appendChild(this.leaderboardDefault.getContainer());

        this.container.appendChild(this.matchList.getContainer());
        this.container.appendChild(this.exitBtn.getContainer());
    }

    destroy(): void {
        this.header.destroy();
        this.leaderboard?.destroy();
        this.leaderboard?.destroy();
        this.matchList.destroy();
        this.exitBtn.destroy();
        super.destroy();
    }
}
