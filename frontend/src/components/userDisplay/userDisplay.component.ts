import { BaseComponent } from "../BaseComponent.ts";
import { AuthService } from "../../services/auth/auth.service.ts";
import { UserService } from "../../services/user/user.service.ts";
import userDisplayTemplate from "./userDisplay.component.html?raw";
import { FriendRequestButton } from "../friendRequest/friendRequest.ts";
import { OnlineStatus } from "../onlineStatus/onlineStatus.ts";

export class UserDisplayComponent extends BaseComponent {
    private authService: AuthService;
    private userService: UserService;
    private username?: string;

    private userAvatar: HTMLImageElement;
    private userName: HTMLElement;

    private friendRequestButton?: FriendRequestButton;
    private onlineStatus?: OnlineStatus;

    constructor(username?: string) {
        super("div", "user-display");
        this.username = username;

        this.authService = AuthService.getInstance();
        this.userService = UserService.getInstance();

        this.container.innerHTML = userDisplayTemplate;

        this.userAvatar = this.container.querySelector("#user-avatar")!;
        this.userName = this.container.querySelector("#user-name")!;

        if (username) this.attachControls(username);

        this.loadUserInfo();
    }

    private async loadUserInfo() {
        try {
            if (!this.username) {
                const user = this.authService.getCurrentUser();
                if (user) {
                    this.userAvatar.src = user.avatar;
                    this.userName.textContent = user.username;
                }
            } else {
                const publicUser = await this.userService.getUserByUsername(this.username);
                this.userAvatar.src = publicUser.avatar;
                this.userName.textContent = publicUser.username;
            }
        } catch (err) {
            console.error("Failed to load user info:", err);
        }
    }

    private attachControls(username: string) {
        if (this.friendRequestButton || this.onlineStatus) return;

        this.friendRequestButton = new FriendRequestButton(username);
        this.onlineStatus = new OnlineStatus(username);

        const nameWrapper = this.userName.parentElement!;
        const controlsWrapper = document.createElement("div");
        controlsWrapper.className = "mt-2 flex items-center space-x-2";

        controlsWrapper.appendChild(this.friendRequestButton.getContainer());
        controlsWrapper.appendChild(this.onlineStatus.getContainer());

        nameWrapper.appendChild(controlsWrapper);
    }

    destroy() {
        this.friendRequestButton?.destroy();
        this.onlineStatus?.destroy();
    }
}
