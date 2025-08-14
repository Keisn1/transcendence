import { BaseComponent } from "../../BaseComponent.ts";
import { TournamentHeader } from "../tournamentHeader/tournamentHeader.ts";
import { TournamentCreationPanel } from "../tournamentCreationPanel/tournamentCreationPanel.ts";
import { TournamentCreationPanelDefault } from "../tournamentCreationPanelDefault/tournamentCreationPanelDefault.ts";

export class TournamentCreation extends BaseComponent {
    private header: TournamentHeader;
    private tournamentCreationPanel: TournamentCreationPanel | null = null;
    private tournamentCreationPanelDefault: TournamentCreationPanelDefault | null = null;

    constructor(defaultComponents: boolean = false) {
        super("div", "tournament-container", "flex min-h-screen flex-col justify-center px-6 py-12 lg:px-8");
        const title = "Pong Tournament Signup";
        const description = "Register up to 4 players below.";
        this.header = new TournamentHeader(title, description);
        this.container.appendChild(this.header.getContainer());

        if (defaultComponents) {
            this.tournamentCreationPanelDefault = new TournamentCreationPanelDefault();
            this.container.appendChild(this.tournamentCreationPanelDefault.getContainer());
        } else {
            this.tournamentCreationPanel = new TournamentCreationPanel();
            this.container.appendChild(this.tournamentCreationPanel.getContainer());
        }
    }

    destroy(): void {
        this.header.destroy();
        this.tournamentCreationPanel?.destroy();
        this.tournamentCreationPanelDefault?.destroy();
        super.destroy();
    }
}
