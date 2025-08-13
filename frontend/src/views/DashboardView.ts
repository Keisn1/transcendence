import AbstractView from "./AbstractView.ts";
import { Navbar } from "../components/navbar/navbar.ts";
import { AdLightBox } from "../components/adLightbox/adLightbox.ts";
import type Router from "../router.ts";
import { AuthService } from "../services/auth/auth.service.ts";
import { DashboardContent } from "../components/dashboardContent/dashboard.component.ts";

export default class extends AbstractView {
    private navbar: Navbar | null = null;
    private adLightBox: AdLightBox | null = null;
    private dashboardContent: DashboardContent | null = null;

    constructor(router?: Router, params?: any[]) {
        super(router, params);
        this.setTitle("Dashboard");
    }

    render() {
        this.navbar = new Navbar();
        document.body.appendChild(this.navbar.getContainer());

        if (!AuthService.getInstance().isAuthenticated()) {
            return;
        }

        this.dashboardContent = new DashboardContent();
        document.body.appendChild(this.dashboardContent.getContainer());

        this.adLightBox = new AdLightBox();
        document.body.appendChild(this.adLightBox.getContainer());
    }

    destroy() {
        console.log("destroying dashboard View");
        // Clean up components
        this.navbar?.destroy();
        this.adLightBox?.destroy();
        this.dashboardContent?.destroy();

        // Remove DOM elements
        document.getElementById("navbar-container")?.remove();
        document.getElementById("dashboard-content")?.remove();
        document.getElementById("ad-lightbox-container")?.remove();

        // Clear references
        this.navbar = null;
        this.dashboardContent = null;
        this.adLightBox = null;
    }
}
