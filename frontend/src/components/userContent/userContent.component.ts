import { BaseComponent } from "../BaseComponent.ts";
import { UserDisplayComponent } from "../userDisplay/userDisplay.component.ts";
import { MatchHistoryComponent } from "../matchHistory/matchHistory.component.ts";

export class UserContent extends BaseComponent {
    private userDisplay: UserDisplayComponent;
    private matchHistory: MatchHistoryComponent;

    constructor(userId: string) {
        super("div", "dashboard-content");

        this.container.className = "max-w-6xl mx-auto mt-8 px-4";

        this.userDisplay = new UserDisplayComponent(userId);
        this.matchHistory = new MatchHistoryComponent(userId);

        this.container.appendChild(this.userDisplay.getContainer());
        this.container.appendChild(this.matchHistory.getContainer());
    }

    destroy(): void {
        this.userDisplay.destroy();
        this.matchHistory.destroy();
        super.destroy();
    }
}
