import AbstractView from "./AbstractView.ts";
import { Navbar } from "../components/navbar/navbar.ts";
import { GameComponent } from "../components/game/gameComponent.ts";

export default class extends AbstractView {
    constructor() {
        super();
        this.setTitle("GameView");
    }

    render() {
        let navbar = new Navbar();
        document.body.appendChild(navbar.getContainer());

        let gameComponent = new GameComponent();
        document.body.appendChild(gameComponent.getContainer());
        gameComponent.play();
    }
}
