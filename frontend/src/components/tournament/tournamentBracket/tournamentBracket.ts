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

    constructor(defaultComponents: boolean = false) {
        super("div", "tournament-container", "mt-8 sm:mx-auto sm:w-full sm:max-w-2xl");
        console.log("constructing bracket component");
        const title = "Tournament Bracket";
        const description = "View upcoming matches and overall schedule.";
        this.header = new TournamentHeader(title, description);

        this.nextMatch = new NextMatch(defaultComponents);
        this.matchList = new MatchList(defaultComponents);
        this.exitButton = new ExitBtn(defaultComponents);

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
