import { BaseComponent } from "../BaseComponent.ts";
import { AuthService } from "../../services/auth/auth.service.ts";
import { UserService } from "../../services/user/user.service.ts";
import userDisplayTemplate from "./userDisplay.component.html?raw";

export class UserDisplayComponent extends BaseComponent {
    private authService: AuthService;
    private userService: UserService;
    private userId?: string;

    private userAvatar: HTMLImageElement;
    private userName: HTMLElement;

    constructor(userId?: string) {
        super("div", "user-display");
        this.userId = userId;

        this.authService = AuthService.getInstance();
        this.userService = UserService.getInstance();

        this.container.innerHTML = userDisplayTemplate;

        this.userAvatar = this.container.querySelector("#user-avatar")!;
        this.userName = this.container.querySelector("#user-name")!;

        this.loadUserInfo();
    }

    private async loadUserInfo() {
        try {
            if (!this.userId) {
                const user = this.authService.getCurrentUser();
                if (user) {
                    this.userAvatar.src = user.avatar;
                    this.userName.textContent = user.username;
                }
            } else {
                const publicUser = await this.userService.getUserById(this.userId);
                this.userAvatar.src = publicUser.avatar;
                this.userName.textContent = publicUser.username;
            }
        } catch (err) {
            console.error("Failed to load user info:", err);
        }
    }
}
