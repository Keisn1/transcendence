import { BaseComponent } from "../BaseComponent";
import { AuthStorage } from "../../services/auth/auth.storage";

export class FriendshipRequests extends BaseComponent {
    constructor() {
        super("div", "friendship-requests", "bg-white rounded-xl shadow p-6 mb-8");

        this.container.innerHTML = `
            <h2 class="text-2xl font-bold text-gray-900 mb-4">Friend Requests</h2>
            <div id="requests-container">
                <div class="text-center py-4">
                    <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto"></div>
                    <p class="mt-2 text-gray-500">Loading requests...</p>
                </div>
            </div>
        `;

        this.loadRequests();
    }

    private async loadRequests() {
        try {
            const response = await fetch("/api/friendship/requests", {
                headers: { Authorization: `Bearer ${AuthStorage.getToken()}` },
            });
            const { requests } = await response.json();

            const container = this.container.querySelector("#requests-container")!;

            if (requests.length === 0) {
                container.innerHTML = `<p class="text-gray-500">No pending friend requests</p>`;
                return;
            }

            container.innerHTML = requests
                .map(
                    (req: any) => `
                <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg mb-2">
                    <div class="flex items-center space-x-3">
                        <img src="${req.avatar}" alt="${req.username}" class="w-10 h-10 rounded-full">
                        <span class="font-medium">${req.username}</span>
                    </div>
                    <div class="space-x-2">
                        <button class="accept-btn px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700" data-id="${req.id}">
                            Accept
                        </button>
                        <button class="decline-btn px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700" data-id="${req.id}">
                            Decline
                        </button>
                    </div>
                </div>
            `,
                )
                .join("");

            this.setupButtonListeners();
        } catch (error) {
            console.error("Failed to load friend requests:", error);
        }
    }

    private setupButtonListeners() {
        this.addEventListenerWithCleanup(this.container, "click", async (e: Event) => {
            const target = e.target as HTMLElement;
            const friendshipId = target.dataset.id;

            if (!friendshipId) return;

            const action = target.classList.contains("accept-btn")
                ? "accept"
                : target.classList.contains("decline-btn")
                  ? "decline"
                  : null;

            if (!action) return;

            try {
                await fetch(`/api/friendship/respond/${friendshipId}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${AuthStorage.getToken()}`,
                    },
                    body: JSON.stringify({ action }),
                });

                this.loadRequests(); // Reload the list
            } catch (error) {
                console.error("Failed to respond to friend request:", error);
            }
        });
    }
}
