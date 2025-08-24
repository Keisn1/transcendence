import { BaseComponent } from "../BaseComponent.ts";
import { UserDisplayComponent } from "../userDisplay/userDisplay.component.ts";
import { MatchHistoryComponent } from "../matchHistory/matchHistory.component.ts";
import { FriendshipRequests } from "../friendshipRequests/friendshipRequests.ts";
import { FriendsList } from "../friendsList/friendsList.ts";

export class DashboardContent extends BaseComponent {
    private userDisplay: UserDisplayComponent;
    private matchHistory: MatchHistoryComponent;
    private friendsList: FriendsList;

    constructor() {
        super("div", "dashboard-content");

        this.container.className = "max-w-6xl mx-auto mt-8 px-4";

        this.userDisplay = new UserDisplayComponent();
        this.friendsList = new FriendsList();
        this.matchHistory = new MatchHistoryComponent();

        // Create a grid layout
        const mainContent = document.createElement("div");
        mainContent.className = "grid grid-cols-1 lg:grid-cols-3 gap-8";

        const leftColumn = document.createElement("div");
        leftColumn.className = "lg:col-span-2 space-y-8";
        leftColumn.appendChild(this.matchHistory.getContainer());

        const rightColumn = document.createElement("div");
        rightColumn.className = "space-y-8";
        rightColumn.appendChild(this.friendsList.getContainer());

        mainContent.appendChild(leftColumn);
        mainContent.appendChild(rightColumn);

        this.container.appendChild(this.userDisplay.getContainer());
        this.container.appendChild(mainContent);

        const friendshipRequests = new FriendshipRequests();
        this.container.insertBefore(friendshipRequests.getContainer(), mainContent);
    }

    destroy(): void {
        this.userDisplay.destroy();
        this.friendsList.destroy();
        this.matchHistory.destroy();
        super.destroy();
    }
}
