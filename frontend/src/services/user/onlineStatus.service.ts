import { AuthStorage } from "../auth/auth.storage";

export class OnlineStatusService {
    private heartbeatInterval: number | null = null;

    startTracking() {
        // Update online status every 30 seconds
        this.updateOnlineStatus(true);
        this.heartbeatInterval = window.setInterval(() => {
            this.updateOnlineStatus(true);
        }, 10000);

        // Set offline when page unloads
        window.addEventListener("beforeunload", () => {
            fetch("/api/user/online-status", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${AuthStorage.getToken()}`,
                },
                body: JSON.stringify({ isOnline: false }),
                keepalive: true, // Ensures request completes even if page closes
            }).catch(() => {}); // Ignore errors on page unload
        });
    }

    private async updateOnlineStatus(isOnline: boolean) {
        try {
            await fetch("/api/user/online-status", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${AuthStorage.getToken()}`,
                },
                body: JSON.stringify({ isOnline }),
            });
        } catch (error) {
            console.error("Failed to update online status:", error);
        }
    }

    stopTracking() {
        console.log("stop trakcing was calledf");
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
        this.updateOnlineStatus(false);
    }
}
