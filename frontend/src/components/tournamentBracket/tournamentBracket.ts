import { BaseComponent } from "../BaseComponent.ts";
import bracketTemplate from "./tournamentBracket.html?raw";
import matchTemplate from "./match.html?raw";
import type { Tournament, Match } from "../../types/tournament.types.ts";
import { BracketMachine, BracketEvent, BracketState } from "./tournamentBracket.machine.ts";
import { GameComponent } from "../gameComponent/gameComponent.ts";

export class TournamentBracket extends BaseComponent {
    // elements
    private headerElement: HTMLElement;
    private nextWrapperElement: HTMLElement;
    private nextDetailsElement: HTMLElement;
    private startBtnElement: HTMLButtonElement;
    private allMatchesWrapperElement: HTMLElement;
    private listElement: HTMLUListElement;
    // states
    private machine!: BracketMachine;
    private gameComponent?: GameComponent;

    constructor() {
        super("div", "tournament-bracket-container");
        this.container.innerHTML = bracketTemplate;

        this.headerElement = this.container.querySelector("#bracket-header")!;
        this.nextWrapperElement = this.container.querySelector("#next-match-wrapper")!;
        this.nextDetailsElement = this.container.querySelector("#next-match-details")!;
        this.startBtnElement = this.container.querySelector("#start-match-btn")!;
        this.allMatchesWrapperElement = this.container.querySelector("#all-matches-wrapper")!;
        this.listElement = this.container.querySelector("#matches-list")!;

        this.loadAndRender();
    }

    private async loadAndRender() {
        const tournament = history.state.initial as Tournament;
        this.machine = new BracketMachine(tournament.bracket);

        this.machine.send(BracketEvent.LOAD);
        this.renderByState(tournament);
    }

    private async renderByState(tournament: Tournament): Promise<void> {
        const state = this.machine.getState();

        this.headerElement.style.display = "";
        this.nextWrapperElement.style.display = "";
        this.allMatchesWrapperElement.style.display = "";

        switch (state) {
            case BracketState.READY:
                this.handleReadyState(tournament);
                break;
            case BracketState.IN_PROGRESS:
                this.handleInProgressState(tournament);
                break;
            case BracketState.MATCH_DONE:
                this.handleMatchDoneState(tournament);
                break;
            case BracketState.COMPLETED:
                this.handleCompletedState(tournament);
                break;
            default:
                break;                
        }
    }

    private handleReadyState(tournament: Tournament): void {
        this.renderList(tournament.bracket);
        this.nextDetailsElement.textContent = "Ready to start first match";
        this.startBtnElement.disabled = false;
        this.startBtnElement.onclick = () => {
            this.machine.send(BracketEvent.START);
            this.renderByState(tournament);
        };
    }
    
    private handleInProgressState(tournament: Tournament): void {
        this.headerElement.style.display = "none";
        this.allMatchesWrapperElement.style.display = "none";
        // this.nextWrapperEl.style.display = "none";

        this.startBtnElement.textContent = "Finish Match";
        this.startBtnElement.disabled = false;
        this.nextDetailsElement.textContent = `Playing: ${this.nextMatchLabel(tournament)}`;

        if (!this.gameComponent) {
            const placeholder = this.container.querySelector("#game-container-placeholder")!;
            this.gameComponent = new GameComponent();
            placeholder.appendChild(this.gameComponent.getContainer());
        }

        this.startBtnElement.onclick = () => {
            this.gameComponent?.destroy();
            this.gameComponent = undefined;
            this.machine.send(BracketEvent.FINISH);
            this.renderByState(tournament);
        };
    }

    private handleMatchDoneState(tournament: Tournament): void {
        this.startBtnElement.textContent = this.machine.hasMoreMatches() ? "Next Match" : "See Results";
        this.startBtnElement.disabled = false;
        this.nextDetailsElement.textContent = "Last result recorded";
        this.startBtnElement.onclick = () => {
            this.machine.send(BracketEvent.NEXT);
            this.renderByState(tournament);
        };
    }

    private handleCompletedState(tournament: Tournament): void {
        this.renderList(tournament.bracket);
        this.nextDetailsElement.textContent = "Tournament Complete!";
    }

    private renderList(bracket: Match[]) {
        this.listElement.innerHTML = "";
        bracket.forEach(m => {
            const status = m.result ?? "Pending";
            const html = matchTemplate
                .replace(/{{player1}}/g, m.player1.username)
                .replace(/{{player2}}/g, m.player2.username)
                .replace(/{{status}}/g, status);
            this.listElement.insertAdjacentHTML("beforeend", html);
        });
    }

    private nextMatchLabel(tournament: Tournament) {
        const next = tournament.bracket.find(m => !m.result)!;
        return `${next.player1.username} vs ${next.player2.username ?? "BYE"}`;
    }

    destroy(): void {
        super.destroy();
    }
}
