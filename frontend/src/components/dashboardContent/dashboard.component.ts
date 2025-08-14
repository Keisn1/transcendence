import { BaseComponent } from "../BaseComponent.ts";
import { UserDisplayComponent } from "../userDisplay/userDisplay.component.ts";
import { MatchHistoryComponent } from "../matchHistory/matchHistory.component.ts";

export class DashboardContent extends BaseComponent {
    private userDisplay: UserDisplayComponent;
    private matchHistory: MatchHistoryComponent;

    constructor() {
        super("div", "dashboard-content");

        this.container.className = "max-w-6xl mx-auto mt-8 px-4";

        this.userDisplay = new UserDisplayComponent();
        this.matchHistory = new MatchHistoryComponent();

        this.container.appendChild(this.userDisplay.getContainer());
        this.container.appendChild(this.matchHistory.getContainer());
    }

    destroy(): void {
        this.userDisplay.destroy();
        this.matchHistory.destroy();
        super.destroy();
    }
}
