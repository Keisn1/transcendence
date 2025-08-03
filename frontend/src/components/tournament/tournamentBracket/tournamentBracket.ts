import { BaseComponent } from "../../BaseComponent.ts";
import { MatchList } from "../matchList/matchList.ts";
import { NextMatch } from "../nextMatch/nextMatch.ts";
import { TournamentHeader } from "../tournamentHeader/tournamentHeader.ts";
import { ExitBtn } from "../exitButton/exitBtn.ts";

export class TournamentBracketComponent extends BaseComponent {
    private header: TournamentHeader;
    private nextMatch: NextMatch;
    private matchList: MatchList;
    private exitButton: ExitBtn;

    constructor() {
        super("div", "tournament-container", "mt-8 sm:mx-auto sm:w-full sm:max-w-2xl");
        console.log("constructing bracket component");
        this.header = new TournamentHeader();
        this.nextMatch = new NextMatch();
        this.matchList = new MatchList();
        this.exitButton = new ExitBtn();

        this.container.appendChild(this.header.getContainer());
        this.container.appendChild(this.nextMatch.getContainer());
        this.container.appendChild(this.matchList.getContainer());
        this.container.appendChild(this.exitButton.getContainer());
    }

    destroy(): void {
        this.header.destroy();
        this.nextMatch.destroy();
        this.matchList.destroy();
        this.exitButton.destroy();
        super.destroy();
    }
}
