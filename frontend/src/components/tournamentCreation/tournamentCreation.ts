// import { TournamentController } from "../../controllers/tournament.controller.ts";
import playerTemplate from "./player.html?raw";
import tournamentTemplate from "./tournamentCreation.html?raw";
import { BaseComponent } from "../BaseComponent.ts";
import { TournamentController } from "../../controllers/tournament.controller.ts";
import type { RegisterPlayerBody, User } from "../../types/tournament.types.ts";

export class TournamentCreation extends BaseComponent {
    private playerContainer: HTMLElement;
    private addedPlayersCount: number = 0;
    private tournamentForm: HTMLFormElement;
    private addPlayerBtn: HTMLButtonElement;
    private registeredPlayers: User[] = [];

    constructor() {
        super("div", "tournament-container");
        this.container.innerHTML = tournamentTemplate;
        this.playerContainer = this.container.querySelector("#players-container")!;
        this.tournamentForm = this.container.querySelector<HTMLFormElement>("#tournament-form")!;
        this.addPlayerBtn = this.container.querySelector<HTMLButtonElement>("#add-player")!;
        this.setupEventListeners();
    }

    private setupEventListeners() {
        this.addEventListenerWithCleanup(this.tournamentForm, "submit", this.handleStartTournament.bind(this));
        this.addEventListenerWithCleanup(this.addPlayerBtn, "click", this.handleAddPlayer.bind(this));
    }

    private handleAddPlayer(e: Event) {
        e.preventDefault();
        if (this.addedPlayersCount >= 4) return;

        const index = this.addedPlayersCount++;
        const html = playerTemplate.replace(/{{index}}/g, `${index}`);
        this.playerContainer.insertAdjacentHTML("beforeend", html);

        const slot = this.playerContainer.querySelector<HTMLElement>(`#player-${index}`)!;

        const removeBtn = slot.querySelector<HTMLButtonElement>(".remove-btn")!;
        removeBtn.addEventListener("click", () => {
            slot.remove();
            this.addedPlayersCount--;
            this.registeredPlayers.splice(index - 1, 1);
        });

        const registerBtn = slot.querySelector<HTMLButtonElement>(".register-player-btn")!;
        registerBtn.addEventListener("click", (ev) => this.registerPlayer(index, ev));
    }

    private async registerPlayer(index: number, e: Event) {
        e.preventDefault();
        const emailElement = this.container.querySelector<HTMLInputElement>(`#email-${index}`);
        const passwordElement = this.container.querySelector<HTMLInputElement>(`#password-${index}`);

        if (!emailElement || !passwordElement) return this.showError("Inputs not found");

        const body: RegisterPlayerBody = {
            playerEmail: emailElement.value,
            playerPassword: passwordElement.value,
        };

        try {
            const controller = TournamentController.getInstance();
            const user = await controller.registerPlayer(body);
            if (this.isPlayerAlreadyRegistered(user)) throw Error("Player already registered");
            console.log(user);
            this.storePlayer(user);
            this.showMessage("User registered successfully");
        } catch (err: any) {
            this.showMessage(err.message ?? "Player registration failed", "error");
        }
    }

    async handleStartTournament(e: Event) {
        e.preventDefault();
        if (this.registeredPlayers.length < 2) {
            return this.showMessage("You need at least two players", "error");
        }

        try {
            TournamentController.getInstance().createTournament(this.registeredPlayers);
            this.showMessage("Tournament was successfully created");
        } catch (err: any) {
            this.showMessage(err.message || "Could not create tournament", "error");
        }
    }

    private isPlayerAlreadyRegistered(user: User): boolean {
        return this.registeredPlayers.some((p) => p.id === user.id);
    }

    private storePlayer(user: User) {
        this.registeredPlayers.push(user);
    }

    private showMessage(message: string, type: "success" | "error" = "success") {
        this.container.querySelectorAll(".info-message").forEach((el) => el.remove());

        const div = document.createElement("div");
        if (type === "success") {
            div.className = `info-message bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded mb-4`;
        } else if (type === "error") {
            div.className = `info-message bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4`;
        }
        div.textContent = message;

        this.tournamentForm.insertAdjacentElement("beforebegin", div);

        setTimeout(() => {
            div.classList.add("opacity-0", "transition", "duration-500");
            setTimeout(() => div.remove(), 500);
        }, 3000);
    }

    private showError(message: string) {
        const existing = this.container.querySelector(".error-message");
        existing?.remove();

        const div = document.createElement("div");
        div.className = "error-message text-red-600 text-sm mt-2 text-center";
        div.textContent = message;

        this.tournamentForm.insertAdjacentElement("afterend", div);
    }

    destroy(): void {
        super.destroy();
    }
}
