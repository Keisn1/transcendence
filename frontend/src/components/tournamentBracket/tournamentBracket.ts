import { BaseComponent } from "../BaseComponent.ts";
import bracketTemplate from "./tournamentBracket.html?raw";
import matchTemplate from "./match.html?raw";
import type { Tournament, Match } from "../../types/tournament.types.ts";

export class TournamentBracket extends BaseComponent {
    private listElement: HTMLUListElement;
    private nextDetailsEl: HTMLElement;
    private startBtn: HTMLButtonElement;

    constructor() {
        super("div", "tournament-bracket-container");
        this.container.innerHTML = bracketTemplate;

        this.listElement = this.container.querySelector("#matches-list")!;
        this.nextDetailsEl = this.container.querySelector("#next-match-details")!;
        this.startBtn = this.container.querySelector("#start-match-btn")!;

        this.loadAndRender();
    }

    private async loadAndRender() {
        let tournament: Tournament | null = history.state?.initial ?? null;

        this.listElement.innerHTML = "";
        let next: Match | null = null;
        if (tournament?.bracket) {
            for (const m of tournament?.bracket) {
                const status = m.result ? "Completed" : "Pending";
                const html = matchTemplate
                    .replace(/{{player1}}/g, m.player1.username)
                    .replace(/{{player2}}/g, m.player2.username ?? "BYE")
                    .replace(/{{status}}/g, status);
                this.listElement.insertAdjacentHTML("beforeend", html);
                if (!m.result && !next) next = m;
            }
        }

        if (next) {
            this.nextDetailsEl.textContent = `${next.player1.username} vs ${next.player2.username ?? "BYE"}`;
            this.startBtn.disabled = false;
            // TODO: navigate to the next round
            // this.startBtn.onclick = () => {
            // 	Router.getInstance()
            // 	.navigateTo(`/game?tournament=${this.tournamentId}&match=${next!.matchId}`);
            // };
        } else {
            this.nextDetailsEl.textContent = "All matches complete!";
            this.startBtn.disabled = true;
        }
    }

    destroy(): void {
        super.destroy();
    }
}
