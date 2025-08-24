import { BaseComponent } from "../BaseComponent";
import { AuthStorage } from "../../services/auth/auth.storage";
import { UserController } from "../../controllers/user.controller";
import friendsListTemplate from "./friendsList.html?raw";

export class FriendsList extends BaseComponent {
    private friendsContent: HTMLElement;

    constructor() {
        super("div", "friends-list");
        this.container.innerHTML = friendsListTemplate;

        this.friendsContent = this.container.querySelector("#friends-content")!;
        this.addEventListenerWithCleanup(this.friendsContent, "click", this.onUserClick.bind(this));

        this.loadFriends();
    }

    private async loadFriends() {
        try {
            const response = await fetch("/api/friendship/friends", {
                headers: { Authorization: `Bearer ${AuthStorage.getToken()}` },
            });

            if (!response.ok) throw new Error("Failed to fetch friends");

            const { friends } = await response.json();
            this.renderFriends(friends);
        } catch (error) {
            console.error("Failed to load friends:", error);
            this.showError("Failed to load friends");
        }
    }

    private renderFriends(friends: any[]) {
        if (friends.length === 0) {
            this.friendsContent.innerHTML = `
                <div class="text-center py-8">
                    <p class="text-gray-500">No friends yet</p>
                </div>
            `;
            return;
        }

        const friendsHtml = friends.map((friend) => this.renderFriend(friend)).join("");
        this.friendsContent.innerHTML = friendsHtml;
    }

    private renderFriend(friend: any): string {
        const onlineIndicator = friend.isOnline
            ? '<div class="w-3 h-3 rounded-full bg-green-500"></div>'
            : '<div class="w-3 h-3 rounded-full bg-gray-400"></div>';

        const statusText = friend.isOnline ? "Online" : `Last seen ${this.formatLastSeen(friend.lastSeen)}`;

        return `
            <div class="flex items-center justify-between p-4 border-b border-gray-100 hover:bg-gray-50">
                <div class="flex items-center space-x-3">
                    <img src="${friend.avatar}"
                         alt="${friend.username}"
                         class="w-10 h-10 rounded-full">
                    <div>
                        <a href="" data-username="${friend.username}"
                           class="font-medium text-gray-900 hover:text-indigo-600">
                            ${friend.username}
                        </a>
                        <div class="flex items-center space-x-2 text-sm text-gray-500">
                            ${onlineIndicator}
                            <span>${statusText}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    private formatLastSeen(lastSeen: string): string {
        if (!lastSeen) return "unknown";

        const date = new Date(lastSeen + (lastSeen.includes("Z") ? "" : "Z"));
        const now = new Date();
        const diff = now.getTime() - date.getTime();

        if (diff < 60000) return "just now";
        if (diff < 3600000) return `${Math.floor(diff / 60000)} minutes ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
        return `${Math.floor(diff / 86400000)} days ago`;
    }

    private onUserClick(e: Event) {
        e.preventDefault();
        const target = e.target as HTMLElement;
        const username = target.dataset.username;
        if (!username) return;

        UserController.getInstance().navigateToUser(`/user/${encodeURIComponent(username)}`);
    }

    private showError(message: string) {
        this.friendsContent.innerHTML = `
            <div class="text-center py-8">
                <p class="text-red-500">${message}</p>
            </div>
        `;
    }
}
