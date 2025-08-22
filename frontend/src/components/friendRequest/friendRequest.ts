import { BaseComponent } from "../BaseComponent";
import { AuthStorage } from "../../services/auth/auth.storage";
import { UserService } from "../../services/user/user.service";

export class FriendRequestButton extends BaseComponent {
    private button: HTMLButtonElement;
    private username: string;
    private userId?: string;

    constructor(username: string) {
        super("div", "friend-request-container");
        this.username = username;

        this.container.innerHTML = `
            <button id="friend-request-btn" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Add Friend
            </button>
        `;

        this.button = this.container.querySelector("#friend-request-btn")!;
        this.addEventListenerWithCleanup(this.button, "click", this.sendRequest.bind(this));

        this.checkFriendshipStatus();
    }

    private async checkFriendshipStatus() {
        try {
            if (!this.userId) this.userId = (await UserService.getInstance().getUserByUsername(this.username!)).id;
            while (!this.userId) {
                await new Promise((resolve) => setTimeout(resolve, 10)); // Wait 10ms between checks
            }

            const response = await fetch(`/api/friendship/status/${this.userId}`, {
                headers: { Authorization: `Bearer ${AuthStorage.getToken()}` },
            });
            const { status } = await response.json();

            if (status === "accepted") {
                this.button.textContent = "Friends";
                this.button.disabled = true;
                this.button.className = "px-4 py-2 bg-green-600 text-white rounded";
            } else if (status === "pending") {
                this.button.textContent = "Request Sent";
                this.button.disabled = true;
                this.button.className = "px-4 py-2 bg-gray-600 text-white rounded";
            } else if (status === "declined") {
                this.button.textContent = "declined";
                this.button.disabled = true;
                this.button.className = "px-4 py-2 bg-indigo-600 text-white rounded";
            } else if (status === "none") {
                // this.container.style.display = "none";
            }
        } catch (error) {
            console.error("Failed to check friendship status:", error);
        }
    }

    private async sendRequest() {
        try {
            if (!this.userId) this.userId = (await UserService.getInstance().getUserByUsername(this.username!)).id;
            while (!this.userId) {
                await new Promise((resolve) => setTimeout(resolve, 10)); // Wait 10ms between checks
            }

            const response = await fetch(`/api/friendship/request/${this.userId}`, {
                method: "POST",
                headers: { Authorization: `Bearer ${AuthStorage.getToken()}` },
            });

            if (response.ok) {
                this.button.textContent = "Request Sent";
                this.button.disabled = true;
                this.button.className = "px-4 py-2 bg-gray-600 text-white rounded";
            }
        } catch (error) {
            console.error("Failed to send friend request:", error);
        }
    }
}
