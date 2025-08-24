import playerSlotTemplate from "./playerSlot.html?raw";
import tournamentCreationPanelTemplate from "./tournamentCreationPanel.html?raw";
import { BaseComponent } from "../../BaseComponent.ts";
import { TournamentController } from "../../../controllers/tournament.controller.ts";
import type { PublicUser } from "../../../types/auth.types.ts";
import { v4 as uuidv4 } from "uuid";
import { AuthController } from "../../../controllers/auth.controller.ts";
import { TwoFactorVerification } from "../../twoFactorVerification/twoFactorVerification.ts";

export class TournamentCreationPanel extends BaseComponent {
    private tournamentForm: HTMLFormElement;
    private playersContainer: HTMLElement;
    private addPlayerBtn: HTMLButtonElement;
    private addedPlayersCount: number = 0;
    private registeredPlayers: { user: PublicUser; token: string }[] = [];

    constructor() {
        super("div", "tournament-container");
        console.log("constructing tournament creation panel");
        this.container.innerHTML = tournamentCreationPanelTemplate;

        this.tournamentForm = this.container.querySelector<HTMLFormElement>("#tournament-form")!;
        this.playersContainer = this.container.querySelector("#players-container")!;
        this.addPlayerBtn = this.container.querySelector<HTMLButtonElement>("#add-player")!;
        this.setupEventListeners();
    }

    private setupEventListeners() {
        this.addEventListenerWithCleanup(this.addPlayerBtn, "click", this.handleAddPlayer.bind(this));
        this.addEventListenerWithCleanup(this.tournamentForm, "submit", this.handleStartTournament.bind(this));
    }

    private handleAddPlayer(e: Event) {
        e.preventDefault();
        if (this.addedPlayersCount >= 4) return;

        this.addedPlayersCount++;
        const slotId = uuidv4();
        const slotHtml = playerSlotTemplate.replace(/{{slotId}}/g, slotId);

        this.playersContainer.insertAdjacentHTML("beforeend", slotHtml);
        const slot = this.playersContainer.lastElementChild as HTMLElement;

        const removeBtn = slot.querySelector<HTMLButtonElement>(".remove-btn")!;
        const registerBtn = slot.querySelector<HTMLButtonElement>(".register-player-btn")!;

        removeBtn.addEventListener("click", (ev) => {
            this.removeHandler(ev, slot);
        });
        registerBtn.addEventListener("click", async (ev) => {
            this.registerHandler(ev, slot, slotId);
        });

        // Disable Add Player button if we've reached the maximum
        if (this.addedPlayersCount >= 4) {
            this.addPlayerBtn.disabled = true;
            this.addPlayerBtn.textContent = "Maximum Players Reached";
        }
    }

    private removeHandler(ev: Event, slot: HTMLElement) {
        ev.preventDefault();

        const playerId = slot.dataset.playerId;
        if (playerId) {
            this.registeredPlayers = this.registeredPlayers.filter((p) => p.user.id !== playerId);
        }

        slot.remove();
        this.addedPlayersCount--;

        if (this.addedPlayersCount < 4) {
            this.addPlayerBtn.disabled = false;
            this.addPlayerBtn.textContent = "Add Player";
        }
    }

    private async registerHandler(ev: Event, slot: HTMLElement, slotId: string) {
        ev.preventDefault();
        const registerBtn = ev.target as HTMLButtonElement;

        // Disable ALL buttons during registration
        this.disableAllButtons();

        // Update the specific register button being used
        registerBtn.textContent = "Registering...";

        const emailInput = slot.querySelector<HTMLInputElement>(`#email-${slotId}`);
        const passwordInput = slot.querySelector<HTMLInputElement>(`#password-${slotId}`);

        if (!emailInput || !passwordInput) {
            this.showMessage("Input elements not found", "error");
            this.enableAllButtons();
            return;
        }

        try {
            const verifyResult = await AuthController.getInstance().verifyUser({
                email: emailInput.value,
                password: passwordInput.value,
            });

            let finalToken = "";

            if (verifyResult.user.twoFaEnabled) {
                const twoFAToken = await this.show2FAVerification();
                if (!twoFAToken) {
                    this.enableAllButtons();
                    return this.showMessage("2FA not completed — registration aborted", "error");
                }

                const verify2FAResult = await AuthController.getInstance().complete2FAVerify(twoFAToken);
                finalToken = verify2FAResult.verificationToken;
            } else {
                finalToken = verifyResult.verificationToken;
            }

            const registrationData = {
                user: {
                    id: verifyResult.user.id,
                    username: verifyResult.user.username,
                    avatar: verifyResult.user.avatar,
                },
                token: finalToken,
            };

            if (this.registeredPlayers.some((p) => p.user.id === registrationData.user.id))
                throw new Error("Player already registered");

            this.registeredPlayers.push(registrationData);
            slot.dataset.playerId = registrationData.user.id;
            this.showMessage("User registered successfully");

            // Re-enable all buttons after successful registration
            this.enableAllButtons();
        } catch (err: any) {
            this.showMessage(err.message || "Registration failed", "error");
            this.enableAllButtons();
        }
    }

    private show2FAVerification(): Promise<string | null> {
        return new Promise((resolve) => {
            try {
                const verification = new TwoFactorVerification(
                    "Enter your 2FA code to complete login:",
                    async (token) => {
                        verification.getContainer().remove();
                        verification.destroy();
                        resolve(token);
                    },
                    () => {
                        AuthController.getInstance().clearPendingVerify();
                        verification.getContainer().remove();
                        verification.destroy();

                        // Re-enable all buttons when 2FA is cancelled
                        this.enableAllButtons();

                        resolve(null);
                    },
                );

                this.container.appendChild(verification.getContainer());
            } catch (err) {
                console.error("error creating 2FA modal:", err);
                this.enableAllButtons(); // Re-enable on error
                resolve(null);
            }
        });
    }

    private async handleStartTournament(e: Event) {
        e.preventDefault();
        if (this.registeredPlayers.length < 2) {
            return this.showMessage("You need at least two players", "error");
        }
        if (this.registeredPlayers.length % 2 !== 0) {
            return this.showMessage("You need an even number of players to start a tournament", "error");
        }

        try {
            await TournamentController.getInstance().createTournamentWithVerification(this.registeredPlayers);
            this.showMessage("Tournament was successfully created");
        } catch (err: any) {
            this.showMessage(err.message || "Could not create tournament", "error");
        }
    }

    private showMessage(message: string, type: "success" | "error" = "success") {
        const messageClass =
            type === "success"
                ? "bg-green-100 border-green-400 text-green-700"
                : "bg-red-100 border-red-400 text-red-700";

        this.container.querySelectorAll(".info-message").forEach((el) => el.remove());

        const div = document.createElement("div");
        div.className = `info-message ${messageClass} border px-4 py-2 rounded mb-4`;
        div.textContent = message;

        this.tournamentForm.insertAdjacentElement("beforebegin", div);

        setTimeout(() => {
            div.classList.add("opacity-0", "transition", "duration-500");
            setTimeout(() => div.remove(), 500);
        }, 3000);
    }

    destroy(): void {
        super.destroy();
    }

    private disableAllButtons() {
        // Disable Add Player button
        this.addPlayerBtn.disabled = true;
        this.addPlayerBtn.textContent = "Registration in Progress...";

        // Disable all Remove buttons
        const removeButtons = this.container.querySelectorAll<HTMLButtonElement>(".remove-btn");
        removeButtons.forEach((btn) => {
            btn.disabled = true;
            btn.textContent = "Wait...";
        });

        // Disable all Register buttons except the one currently being used
        const registerButtons = this.container.querySelectorAll<HTMLButtonElement>(".register-player-btn");
        registerButtons.forEach((btn) => (btn.disabled = true));
    }

    private enableAllButtons() {
        // Re-enable Add Player button (unless at max capacity)
        if (this.addedPlayersCount < 4) {
            this.addPlayerBtn.disabled = false;
            this.addPlayerBtn.textContent = "Add Player";
        }

        // Re-enable all Remove buttons
        const removeButtons = this.container.querySelectorAll<HTMLButtonElement>(".remove-btn");
        removeButtons.forEach((btn) => {
            btn.disabled = false;
            btn.textContent = "Remove";
        });

        // Re-enable all Register buttons
        const registerButtons = this.container.querySelectorAll<HTMLButtonElement>(".register-player-btn");
        registerButtons.forEach((btn) => {
            btn.disabled = false;
            btn.textContent = "Register";
        });
    }
}
