import { BaseComponent } from "../BaseComponent";
import { AuthStorage } from "../../services/auth/auth.storage";
import { UserService } from "../../services/user/user.service";

export class OnlineStatus extends BaseComponent {
    private userId?: string;

    constructor(username: string) {
        super("div", "online-status", "inline-flex items-center space-x-2");
        this.checkOnlineStatus(username);
    }

    private async checkOnlineStatus(username: string) {
        try {
            if (!this.userId) this.userId = (await UserService.getInstance().getUserByUsername(username)).id;
            while (!this.userId) {
                await new Promise((resolve) => setTimeout(resolve, 10)); // Wait 10ms between checks
            }

            // Check if they're friends first
            const friendshipResponse = await fetch(`/api/friendship/status/${this.userId}`, {
                headers: { Authorization: `Bearer ${AuthStorage.getToken()}` },
            });
            const { status } = await friendshipResponse.json();

            console.log("status is: ", status);
            if (status !== "accepted") return; // Only show for friends

            // Get online status
            const statusResponse = await fetch(`/api/user/online-status/${this.userId}`, {
                headers: { Authorization: `Bearer ${AuthStorage.getToken()}` },
            });
            const { isOnline, lastSeen } = await statusResponse.json();

            this.container.innerHTML = `
                <div class="flex items-center space-x-2">
                    <div class="w-3 h-3 rounded-full ${isOnline ? "bg-green-500" : "bg-gray-400"}"></div>
                    <span class="text-sm text-gray-600">
                        ${isOnline ? "Online" : `Last seen ${this.formatLastSeen(lastSeen)}`}
                    </span>
                </div>
            `;
        } catch (error) {
            console.error("Failed to check online status:", error);
        }
    }

    private formatLastSeen(lastSeen: string): string {
        const date = new Date(lastSeen + (lastSeen.includes("Z") ? "" : "Z")); // Ensure UTC parsing
        const now = new Date();
        const diff = now.getTime() - date.getTime();

        if (diff < 60000) return "just now";
        if (diff < 3600000) return `${Math.floor(diff / 60000)} minutes ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
        return `${Math.floor(diff / 86400000)} days ago`;
    }
}
