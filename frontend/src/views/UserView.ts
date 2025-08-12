import AbstractView from "./AbstractView.ts";
import { Navbar } from "../components/navbar/navbar.ts";
import type Router from "../router.ts";
import { AuthService } from "../services/auth/auth.service.ts";
import { DashboardContent } from "../components/DashboardContent/dashboardContent.ts";

export default class extends AbstractView {
    private navbar: Navbar | null = null;
    private dashboardContent: DashboardContent | null = null;

    constructor(router?: Router) {
        super(router);
        this.setTitle("User");
    }

    render() {
        if (!AuthService.getInstance().isAuthenticated()) {
            this.router?.navigateTo("/login");
            return;
        }

        // TODO: erik: super hardcoded, I guess there should be something like this.router.getParam()
        const userId = "9dadde86-469d-47e8-8fd3-7442aadb8eaf"; 

        this.navbar = new Navbar();
        document.body.appendChild(this.navbar.getContainer());

        this.dashboardContent = new DashboardContent(userId);
        document.body.appendChild(this.dashboardContent.getContainer());
    }

    destroy() {
        console.log("Destroying UserView");
        this.navbar?.destroy();
        this.dashboardContent?.destroy();
        document.getElementById("navbar-container")?.remove();
        document.getElementById("dashboard-content")?.remove();
    }
}
