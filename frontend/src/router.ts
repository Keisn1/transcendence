import AbstractView from "./views/AbstractView";
import DashboardView from "./views/DashboardView.ts";
import GameView from "./views/GameView.ts";
import ProfileView from "./views/ProfileView.ts";

export default class Router {
    private currentView: AbstractView | null = null;

    constructor() {
        window.addEventListener("popstate", this.routing.bind(this));
    }

    navigateTo = (url: string) => {
        history.pushState(null, "", url);
        this.routing();
    };

    private routing() {
        if (this.currentView && typeof this.currentView.destroy === "function") {
            this.currentView.destroy();
        }
        let routes = [
            {
                path: "/",
                view: DashboardView,
            },
            {
                path: "/game",
                view: GameView,
            },
            {
                path: "/profile",
                view: ProfileView,
            },
        ];

        let potentialMatches = routes.map((route) => {
            return {
                route: route,
                result: location.pathname.match(this.pathToRegex(route.path)),
            };
        });

        let match = potentialMatches.find((potentialMatch) => potentialMatch.result !== null);

        if (!match) {
            console.log("not found");
            match = {
                route: routes[0],
                result: [location.pathname],
            };
        }

        this.currentView = new match.route.view();
        this.currentView.render();
    }

    private pathToRegex = (path: string) =>
        new RegExp(
            "^" +
                path
                    .replace(
                        /\//g,
                        "\\/", // regular expression equivalent of / (\ needs to be escaped in the string)
                    )
                    .replace(
                        /:\w+/g, // match colon and one or more word characters, globally
                        "(.+)", // capturing group (anything one or more times)
                    ) +
                "$",
        );
}
