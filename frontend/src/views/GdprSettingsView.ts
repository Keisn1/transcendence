import AbstractView from "./AbstractView";
import { Navbar } from "../components/navbar/navbar";
import { GdprButtons } from "../components/gdprButtons/gdprButtons";
import { AuthController } from "../controllers/auth.controller";
import type Router from "../router";

export default class extends AbstractView {
    private navbar: Navbar | null = null;
    private gdprButtons: GdprButtons | null = null;

    constructor(router?: Router, params?: any[]) {
        super(router, params);
        this.setTitle("GDPR Settings");
    }

    render() {
        this.navbar = new Navbar();
        document.body.appendChild(this.navbar.getContainer());

        this.gdprButtons = new GdprButtons(this.handleGdprAction.bind(this));
        document.body.appendChild(this.gdprButtons.getContainer());
    }

    private async handleGdprAction(action: "delete" | "anonymize") {
        try {
            const response = await fetch("/api/gdpr/" + action, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("authToken")}`,
                },
            });

            const result = await response.json();
            if (result.success) {
                alert("Action completed. You will be logged out.");
                const authController = AuthController.getInstance();
                authController.logout();
                return;
            } else {
                alert(result.error || "Action failed.");
            }
        } catch (err) {
            alert("Network error or server unavailable.");
        }
    }

    destroy() {
        this.navbar?.destroy();
        this.gdprButtons?.destroy();
        document.getElementById("navbar-container")?.remove();
        document.getElementById("gdpr-buttons-container")?.remove();
        this.navbar = null;
        this.gdprButtons = null;
    }
}
