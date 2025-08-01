import { BaseComponent } from "../BaseComponent.ts";
import tournamentTemplate from "./tournament.html?raw";
import matchTemplate from "./match.html?raw";
import type { Tournament, Match } from "../../types/tournament.types.ts";
import { TournamentMachine, TournamentEvent, TournamentState } from "./tournament.machine.ts";
import { GameComponent } from "../gameComponent/gameComponent.ts";
import { GameControlsTournamentComponent } from "../gameControls/gameControlsTournament/gameControlsTournament.ts"

export class TournamentComponent extends BaseComponent {
    // elements
    private headerElement: HTMLElement;
    private nextWrapperElement: HTMLElement;
    private nextDetailsElement: HTMLElement;
    private startBtnElement: HTMLButtonElement;
    private allMatchesWrapperElement: HTMLElement;
    private listElement: HTMLUListElement;
    // states
    private machine!: TournamentMachine;
    private gameComponent?: GameComponent;

    constructor() {
        super("div", "tournament-container");
        this.container.innerHTML = tournamentTemplate;

        this.headerElement = this.container.querySelector("#tournament-header")!;
        this.nextWrapperElement = this.container.querySelector("#next-match-wrapper")!;
        this.nextDetailsElement = this.container.querySelector("#next-match-details")!;
        this.startBtnElement = this.container.querySelector("#start-match-btn")!;
        this.allMatchesWrapperElement = this.container.querySelector("#all-matches-wrapper")!;
        this.listElement = this.container.querySelector("#matches-list")!;

        this.loadAndRender();
    }

    private async loadAndRender() {
        const tournament = history.state.tournament as Tournament;
        this.machine = new TournamentMachine(tournament.bracket);

        this.machine.send(TournamentEvent.LOAD);
        this.renderByState(tournament);
    }

    private async renderByState(tournament: Tournament): Promise<void> {
        const state = this.machine.getState();

        this.headerElement.style.display = "none";
        this.startBtnElement.style.display = "none";
        this.nextWrapperElement.style.display = "none";
        this.allMatchesWrapperElement.style.display = "none";

        switch (state) {
            case TournamentState.READY:
                this.handleReadyState(tournament);
                break;

            case TournamentState.IN_PROGRESS:
                this.handleInProgressState(tournament);
                break;

            case TournamentState.MATCH_DONE:
                this.handleMatchDoneState(tournament);
                break;

            case TournamentState.COMPLETED:
                this.handleCompletedState(tournament);
                break;

            default:
                break;                
        }
    }

    private handleReadyState(tournament: Tournament): void {
        this.headerElement.style.display = "";
        this.startBtnElement.style.display = "";
        this.nextWrapperElement.style.display = "";
        this.allMatchesWrapperElement.style.display = "";
        this.renderList(tournament.bracket);
        this.nextDetailsElement.textContent = "Ready to start first match";
        this.startBtnElement.disabled = false;
        this.startBtnElement.onclick = () => {
            this.machine.send(TournamentEvent.START);
            this.renderByState(tournament);
        };
    }
    
    private handleInProgressState(tournament: Tournament): void {
        this.nextDetailsElement.textContent = `Playing: ${this.nextMatchLabel(tournament)}`;

        if (!this.gameComponent) {
            const placeholder = this.container.querySelector("#game-container-placeholder")!;
            this.gameComponent = new GameComponent(GameControlsTournamentComponent);
            placeholder.appendChild(this.gameComponent.getContainer());

            if (this.gameComponent.gameControls.onFinish) {
                this.gameComponent.gameControls.onFinish(() => {
                    const winner = this.gameComponent!.getResult();
                    const matchIndex = tournament.bracket.findIndex(m => !m.result)!;
                    tournament.bracket[matchIndex].result = winner;
                    
                    console.log(winner);
                    console.log(tournament.bracket[matchIndex].result);

                    this.gameComponent?.destroy();
                    this.gameComponent = undefined;
                    this.machine.send(TournamentEvent.FINISH);
                    this.renderByState(tournament);
                });
            }
        }
    }

    private handleMatchDoneState(tournament: Tournament): void {
        this.headerElement.style.display = "";
        this.startBtnElement.style.display = "";
        this.nextWrapperElement.style.display = "";
        this.allMatchesWrapperElement.style.display = "";
        this.startBtnElement.textContent = this.machine.hasMoreMatches() ? "Next Match" : "See Results";
        this.startBtnElement.disabled = false;
        this.nextDetailsElement.textContent = "Last result recorded";
        this.startBtnElement.onclick = () => {
            this.machine.send(TournamentEvent.NEXT);
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
