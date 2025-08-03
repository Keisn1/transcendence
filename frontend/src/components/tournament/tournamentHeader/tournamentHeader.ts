import { BaseComponent } from "../../BaseComponent.ts";
import headerTemplate from "./tournamentHeader.html?raw";

export class TournamentHeader extends BaseComponent {
    constructor() {
        super("div", "tournament-header-container");
        console.log("constructing bracket component");
        this.container.innerHTML = headerTemplate;
    }
    destroy(): void {
        super.destroy();
    }
}
