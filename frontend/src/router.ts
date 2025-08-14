import AbstractView from "./views/AbstractView";
import DashboardView from "./views/DashboardView.ts";
import GameView from "./views/GameView.ts";
import ProfileView from "./views/ProfileView.ts";
import LoginView from "./views/LoginView.ts";
import SignUpView from "./views/SignUpView.ts";
import TournamentView from "./views/TournamentView.ts";
import GdprSettingsView from "./views/GdprSettingsView";
import SettingsView from "./views/SettingsView";
import UserView from "./views/UserView.ts";

interface Route {
    path: string;
    view: new (router: Router, params: any) => AbstractView;
}

export default class Router {
    private currentView: AbstractView | null = null;

    constructor() {
        window.addEventListener("popstate", this.routing.bind(this));
        this.routing();
    }

    navigateTo = (url: string) => {
        history.pushState(null, "", url);
        this.routing();
    };

    private routing() {
        let routes: Route[] = [
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
            {
                path: "/login",
                view: LoginView,
            },
            {
                path: "/signup",
                view: SignUpView,
            },
            {
                path: "/tournament",
                view: TournamentView,
            },
            {
                path: "/settings",
                view: SettingsView,
            },
            {
                path: "/settings/gdpr",
                view: GdprSettingsView,
            },
            {
                path: "/user/:username",
                view: UserView,
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

        if (this.currentView && typeof this.currentView.destroy === "function") {
            console.log("destroying a view");
            this.currentView.destroy();
        }

        console.log("creating new view");
        console.log("params Match:", this.getParams(match));
        this.currentView = new match.route.view(this, this.getParams(match));
        this.currentView.render();
    }

    private getParams(match: { route: Route; result: RegExpMatchArray | null }): any {
        if (!match.result) return {};
        const values = match.result.slice(1);
        const keys = Array.from(match.route.path.matchAll(/:(\w+)/g)).map((result: any) => result[1]);
        return Object.fromEntries(
            keys.map((key, i) => {
                return [key, values[i]];
            }),
        );
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
