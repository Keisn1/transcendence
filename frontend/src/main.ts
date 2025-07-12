import "./style.css";
import "./components/navbar/navbar.ts"; // Add this line
import "./components/adLightbox/adLightbox.ts"; // Add this line
import DashboardView from "./views/DashboardView.ts";
import GameView from "./views/GameView.ts";

const pathToRegex = (path: string) =>
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

const router = () => {
    let routes = [
        {
            path: "/",
            view: DashboardView,
        },
        {
            path: "/game",
            view: GameView,
        },
    ];

    let potentialMatches = routes.map((route) => {
        return {
            route: route,
            result: location.pathname.match(pathToRegex(route.path)),
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

    const view = new match.route.view();
    view.render();
};

router();
