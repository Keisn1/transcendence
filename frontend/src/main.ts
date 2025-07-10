import "./style.css";
import "./components/navbar/navbar.ts"; // Add this line
import "./components/adLightbox/adLightbox.ts"; // Add this line
import Dashboard from "./views/Dashboard.ts";

const router = () => {
    let routes = [
        {
            path: "/",
            view: Dashboard,
        },
        {
            path: "/game",
            view: Dashboard,
        },
    ];

    let potentialMatches = routes.map((route) => {
        return {
            route: route,
            result: location.pathname.match(route.path),
        };
    });

    let match = potentialMatches.find((potentialMatch) => potentialMatch.result !== null);

    if (!match) {
        match = {
            route: routes[0],
            result: [location.pathname],
        };
    }

    const view = new match.route.view();
    view.render();
};

router();
