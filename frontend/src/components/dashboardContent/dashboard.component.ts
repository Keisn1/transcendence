import { BaseComponent } from "../BaseComponent.ts";
import { UserDisplayComponent } from "../userDisplay/userDisplay.component.ts";
import { MatchHistoryComponent } from "../matchHistory/matchHistory.component.ts";

export class DashboardContent extends BaseComponent {
    private userDisplay: UserDisplayComponent;
    private matchHistory?: MatchHistoryComponent | null = null;

    constructor() {
        super("div", "dashboard-content");

        this.container.className = "max-w-6xl mx-auto mt-8 px-4";

        this.userDisplay = new UserDisplayComponent();

        this.container.appendChild(this.userDisplay.getContainer());

        // Initialize match history asynchronously
        this.initMatchHistory();
    }

    private async initMatchHistory() {
        try {
            this.matchHistory = await MatchHistoryComponent.create();
            this.container.appendChild(this.matchHistory.getContainer());
        } catch (error) {
            console.error("Failed to initialize match history:", error);
            // Optionally show error state
        }
    }

    destroy(): void {
        this.userDisplay.destroy();
        this.matchHistory?.destroy();
        super.destroy();
    }
}
