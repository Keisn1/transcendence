import AbstractView from "./AbstractView.ts";
import { Navbar } from "../components/navbar/navbar.ts";
import type Router from "../router.ts";
import { AuthService } from "../services/auth/auth.service.ts";
import { UserContent } from "../components/userContent/userContent.component.ts";
import { FriendRequestButton } from "../components/friendRequest/friendRequest.ts";
import { OnlineStatus } from "../components/onlineStatus/onlineStatus.ts";

export default class extends AbstractView {
    private navbar: Navbar | null = null;
    private userContent: UserContent | null = null;

    constructor(router?: Router, params?: any) {
        super(router, params);
        console.log(params);
        this.setTitle("User");
    }

    render() {
        if (!AuthService.getInstance().isAuthenticated()) {
            this.router?.navigateTo("/login");
            return;
        }

        this.navbar = new Navbar();
        document.body.appendChild(this.navbar.getContainer());

        if (!this.params) {
            console.log("no parameters give");
            return;
        }
        if (!("username" in this.params)) {
            console.log("no id in params");
        }

        this.userContent = new UserContent(this.params.username);
        document.body.appendChild(this.userContent.getContainer());

        const friendRequestButton = new FriendRequestButton(this.params.username);
        this.userContent.getContainer().appendChild(friendRequestButton.getContainer());

        const onlineStatus = new OnlineStatus(this.params.username);
        this.userContent.getContainer().appendChild(onlineStatus.getContainer());
    }

    destroy() {
        console.log("Destroying UserView");
        this.navbar?.destroy();
        this.userContent?.destroy();
        document.getElementById("navbar-container")?.remove();
        document.getElementById("dashboard-content")?.remove();
    }
}
