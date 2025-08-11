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
    private registeredPlayers: PublicUser[] = [];

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
            registerBtn.disabled = false;
        });
        registerBtn.addEventListener("click", async (ev) => {
            this.registerHandler(ev, slot, slotId);
        });
    }

    private removeHandler(ev: Event, slot: HTMLElement) {
        ev.preventDefault();

        const playerId = slot.dataset.playerId;
        if (playerId) {
            this.registeredPlayers = this.registeredPlayers.filter((p) => p.id !== playerId);
        }

        slot.remove();
        this.addedPlayersCount--;
        console.log("After removal:", this.registeredPlayers);
    }

    private async registerHandler(ev: Event, slot: HTMLElement, slotId: string) {
        ev.preventDefault();
        const registerBtn = ev.target as HTMLButtonElement;
        registerBtn.disabled = true;

        const emailInput = slot.querySelector<HTMLInputElement>(`#email-${slotId}`);
        const passwordInput = slot.querySelector<HTMLInputElement>(`#password-${slotId}`);

        if (!emailInput || !passwordInput) {
            this.showMessage("Input elements not found", "error");
            return;
        }

        try {
            const user = await AuthController.getInstance().verifyUser({
                email: emailInput.value,
                password: passwordInput.value,
            });

            if (user.twoFaEnabled) {
                const ok = await this.show2FAVerification();
                if (!ok) {
                    registerBtn.disabled = false;
                    return this.showMessage("2FA not completed — registration aborted", "error");
                }
            }

            if (this.registeredPlayers.some((p) => p.id === user.id)) throw new Error("Player already registered");
            this.registeredPlayers.push(user);
            slot.dataset.playerId = user.id;
            this.showMessage("User registered successfully");
        } catch (err: any) {
            this.showMessage(err.message || "Registration failed", "error");
            registerBtn.disabled = false;
        }
        console.log("After registration:", this.registeredPlayers);
    }

    private show2FAVerification(): Promise<boolean> {
        return new Promise((resolve) => {
            try {
                const verification = new TwoFactorVerification(
                    "Enter your 2FA code to complete login:",
                    async (token) => {
                        try {
                            await AuthController.getInstance().complete2FAVerify(token);
                            verification.getContainer().remove();
                            verification.destroy();
                            resolve(true); // success
                        } catch (error) {
                            // let TwoFactorVerification show the error, keep modal open
                            console.error("2FA verify failed:", error);
                            throw error; // Let TwoFactorVerification handle error display
                        }
                    },
                    () => {
                        AuthController.getInstance().clearPendingVerify();
                        verification.getContainer().remove();
                        verification.destroy();
                        resolve(false);
                    },
                );

                this.container.appendChild(verification.getContainer());
            } catch (err) {
                console.error("error creating 2FA modal:", err);
                resolve(false);
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
            await TournamentController.getInstance().createTournament(this.registeredPlayers);
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
}
