// import { TournamentController } from "../../controllers/tournament.controller.ts";
import { BaseComponent } from "../BaseComponent";
import playerTemplate from "./player.html?raw";
import tournamentTemplate from "./tournament.html?raw";
import type { TournamentCreationBody, RegisterPlayerBody } from "../../types/tournament.types.ts";
import { TournamentController } from "../../controllers/tournament.controller.ts";
import Router from "../../router";


export class TournamentSignup extends BaseComponent {
    private playerContainer: HTMLElement;
    private addedPlayersCount: number = 0;
    private tournamentForm: HTMLFormElement;
    private addPlayerBtn: HTMLButtonElement;

    constructor() {
        super("div", "tournament-container");
        this.container.innerHTML = tournamentTemplate;
        this.playerContainer = this.container.querySelector("#players-container")!;
        this.tournamentForm = this.container.querySelector<HTMLFormElement>("#tournament-form")!;
        this.addPlayerBtn = this.container.querySelector<HTMLButtonElement>("#add-player")!;
        this.setupEventListeners();
    }

    private setupEventListeners() {
        // this.addEventListenerWithCleanup(this.tournamentForm, "submit", this.handleSubmit.bind(this));
        this.addEventListenerWithCleanup(this.addPlayerBtn, "click", this.handleAddPlayer.bind(this));
    }

    private registerPlayer(index: number, e: Event) {
        e.preventDefault();

        const emailEl = this.container.querySelector<HTMLInputElement>(`#email-${index}`);
        const passwordEl = this.container.querySelector<HTMLInputElement>(`#password-${index}`);
        
        if (!emailEl || !passwordEl) return this.showError("Inputs not found");

        const body: RegisterPlayerBody = {
            playerEmail: emailEl.value,
            playerPassword: passwordEl.value,
        };

        // …POST to /verify-player with JWT + body…

        const tournamentController = TournamentController.getInstance();
        tournamentController.registerPlayer(body);
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
        });

        const registerBtn = slot.querySelector<HTMLButtonElement>(".register-player-btn")!;
        registerBtn.addEventListener("click", (ev) => this.registerPlayer(index, ev));
    }

    // private async handleSubmit(e: Event) {
    //     e.preventDefault();
    //     const data = this.getFormData();

    //     if (!this.validate(data)) return;

    //     try {
    //         // const controller = TournamentController.getInstance();
    //         // await controller.registerPlayers(data);
    //     } catch (error) {
    //         console.error("Tournament signup failed:", error);
    //         this.showError("Signup failed. Please try again.");
    //     }
    // }

    // private getFormData(): TournamentCreationBody {
    //     return {
    //         player1Id: (this.container.querySelector("#player1") as HTMLInputElement).value,
    //         player2Id: (this.container.querySelector("#player2") as HTMLInputElement).value,
    //         player3Id: (this.container.querySelector("#player3") as HTMLInputElement).value,
    //         player4Id: (this.container.querySelector("#player4") as HTMLInputElement).value,
    //     };
    // }

    private validate(data: TournamentCreationBody): boolean {
        const names = [data.player1Id, data.player2Id, data.player3Id, data.player4Id]
            .map((name) => name?.trim())
            .filter(Boolean);

        if (names.length < 2) {
            this.showError("At least two players are required to start a tournament.");
            return false;
        }
        return true;
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
