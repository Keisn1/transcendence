import { BaseComponent } from "../../BaseComponent.ts";
import { TournamentHeader } from "../tournamentHeader/tournamentHeader.ts";
import { TournamentCreationPanel } from "../tournamentCreationPanel/tournamentCreationPanel.ts";

export class TournamentCreation extends BaseComponent {
    private header: TournamentHeader;
    private tournamentCreationPanel: TournamentCreationPanel   

    constructor() {
        super("div", "tournament-container", "flex min-h-screen flex-col justify-center px-6 py-12 lg:px-8");

        const title = "Pong Tournament Signup";
        const description = "Register up to 4 players below.";
        this.header = new TournamentHeader(title, description);
        this.tournamentCreationPanel = new TournamentCreationPanel();

        this.container.appendChild(this.header.getContainer());
        this.container.appendChild(this.tournamentCreationPanel.getContainer());
    }

    destroy(): void {
        this.header.destroy();
        this.tournamentCreationPanel.destroy();
        super.destroy();
    }
}
