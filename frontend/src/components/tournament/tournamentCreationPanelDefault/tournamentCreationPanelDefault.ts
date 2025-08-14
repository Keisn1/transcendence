import playerSlotTemplate from "./playerSlot.html?raw";
import tournamentCreationPanelTemplate from "./tournamentCreationPanelDefault.html?raw";
import { BaseComponent } from "../../BaseComponent.ts";
import { TournamentController } from "../../../controllers/tournament.controller.ts";
import type { PublicUser } from "../../../types/auth.types.ts";
import { v4 as uuidv4 } from "uuid";

export class TournamentCreationPanelDefault extends BaseComponent {
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
        });
        registerBtn.addEventListener("click", async (ev) => {
            this.registerHandler(ev, slot, slotId);
        });
    }

    private removeHandler(ev: Event, slot: HTMLElement) {
        ev.preventDefault();

        const alias = slot.dataset.alias;
        if (alias) {
            this.registeredPlayers = this.registeredPlayers.filter((p) => p.username !== alias);
        }

        slot.remove();
        this.addedPlayersCount--;
        console.log("After removal:", this.registeredPlayers);
    }

    private async registerHandler(ev: Event, slot: HTMLElement, slotId: string) {
        ev.preventDefault();
        const registerBtn = ev.target as HTMLButtonElement;
        registerBtn.disabled = true;

        // check if alias already present
        const aliasInput = slot.querySelector<HTMLInputElement>(`#alias-${slotId}`);

        if (!aliasInput) {
            this.showMessage("Input elements not found", "error");
            return;
        }

        const alias = aliasInput.value;
        // TODO: validate alias

        try {
            if (this.registeredPlayers.some((p) => p.username === alias))
                throw new Error("Player with this username already registered");

            const publicUser: PublicUser = {
                id: "00000000-0000-0000-0000-000000000000",
                username: alias,
                avatar: "default-pfp.png",
            };

            this.registeredPlayers.push(publicUser);
            slot.dataset.alias = alias;
            this.showMessage("User registered successfully");
        } catch (err: any) {
            this.showMessage(err.message || "Registration failed", "error");
            registerBtn.disabled = false;
        }
        console.log("After registration:", this.registeredPlayers);
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
            await TournamentController.getInstance().createTournamentDefault(this.registeredPlayers);
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
