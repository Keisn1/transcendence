import { BaseComponent } from "../../BaseComponent.ts";
import headerTemplate from "./tournamentHeader.html?raw";

export class TournamentHeader extends BaseComponent {
    constructor(title: string , description: string) {
        super("div", "tournament-header-container");
        console.log("constructing bracket component");
        this.container.innerHTML = headerTemplate.replace(/{{title}}/g, title).replace(/{{description}}/g, description);
    }
    destroy(): void {
        super.destroy();
    }
}
