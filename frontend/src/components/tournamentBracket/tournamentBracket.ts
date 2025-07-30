import { BaseComponent } from "../BaseComponent.ts";
import bracketTemplate from "./tournamentBracket.html?raw";
import matchTemplate from "./match.html?raw";
import type { Tournament, Match } from "../../types/tournament.types.ts";
import { BracketMachine, BracketEvent, BracketState } from "./tournamentBracket.machine.ts";
import { GameComponent } from "../gameComponent/gameComponent.ts";

export class TournamentBracket extends BaseComponent {
    private listElement: HTMLUListElement;
    private nextDetailsElement: HTMLElement;
    private startBtn: HTMLButtonElement;
    private machine!: BracketMachine;
    private gameComponent?: GameComponent;

    constructor() {
        super("div", "tournament-bracket-container");
        this.container.innerHTML = bracketTemplate;

        this.listElement = this.container.querySelector("#matches-list")!;
        this.nextDetailsElement = this.container.querySelector("#next-match-details")!;
        this.startBtn = this.container.querySelector("#start-match-btn")!;

        this.loadAndRender();
    }

    private async loadAndRender() {
        const tournament = history.state.initial as Tournament;

        this.machine = new BracketMachine(tournament.bracket);
        this.machine.send(BracketEvent.LOAD);

        this.renderByState(tournament);
    }

    private async renderByState(tournament: Tournament){
        const state = this.machine.getState();
        switch (state) {
            case BracketState.READY:
                this.renderList(tournament.bracket);
                this.nextDetailsElement.textContent = "Ready to start first match";
                this.startBtn.disabled = false;
                this.startBtn.onclick = () => {
                    this.machine.send(BracketEvent.START);
                    this.renderByState(tournament);
                };
                break;
            case BracketState.IN_PROGRESS:
                this.startBtn.textContent = "Finish Match";
                this.startBtn.disabled = false;
                this.nextDetailsElement.textContent = `Playing: ${this.nextMatchLabel(tournament)}`;

                if (!this.gameComponent) {
                    const placeholder = this.container.querySelector("#game-container-placeholder")!;
                    this.gameComponent = new GameComponent();
                    placeholder.appendChild(this.gameComponent.getContainer());
                }

                this.startBtn.onclick = () => {
                    this.gameComponent?.destroy();
                    this.gameComponent = undefined;
                    this.machine.send(BracketEvent.FINISH);
                    this.renderByState(tournament);
                };
                break;
            case BracketState.MATCH_DONE:
                this.startBtn.textContent = this.machine.hasMoreMatches() ? "Next Match" : "See Results";
                this.startBtn.disabled = false;
                this.nextDetailsElement.textContent = "Last result recorded";
                this.startBtn.onclick = () => {
                    this.machine.send(BracketEvent.NEXT);
                    this.renderByState(tournament);
                };
                break;
            case BracketState.COMPLETED:
                this.renderList(tournament.bracket);
                this.nextDetailsElement.textContent = "Tournament Complete!";
                break;
            default:
                break;                
        }
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
