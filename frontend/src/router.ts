import AbstractView from "./views/AbstractView";
import DashboardView from "./views/DashboardView.ts";
import GameView from "./views/GameView.ts";
import ProfileView from "./views/ProfileView.ts";
import LoginView from "./views/LoginView.ts";
import { AuthController } from "./controllers/auth.controller.ts";
import SignUpView from "./views/SignUpView.ts";
import TournamentCreationView from "./views/TournamentCreationView.ts"
import TournamentView from "./views/TournamentView.ts"

export default class Router {
    private currentView: AbstractView | null = null;

    constructor() {
        window.addEventListener("popstate", this.routing.bind(this));
        this.routing();
    }

    navigateTo = (url: string, options?: { state?: any }) => {
        history.pushState(options?.state ?? null, "", url);
        this.routing();
    };

    private routing() {
        const authController = AuthController.getInstance();
        const dontCound = ["/login", "/signout", "/signup"];
        if (authController && !dontCound.includes(location.pathname)) {
            authController.setPreviousRoute(location.pathname);
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
                view: TournamentCreationView,
            },
            {
                path: "/tournament/:id",
                view: TournamentView,
            }
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
        this.currentView = new match.route.view(this);
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
