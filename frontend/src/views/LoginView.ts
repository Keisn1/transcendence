import AbstractView from "./AbstractView.ts";
import { Navbar } from "../components/navbar/navbar.ts";
import { Login } from "../components/login/login.ts";
import type Router from "../router.ts";

export default class extends AbstractView {
    private navbar: Navbar | null = null;
    private login: Login | null = null;

    constructor(router?: Router, params?: any[]) {
        super(router, params);
        this.setTitle("Login");
    }

    render() {
        this.navbar = new Navbar();
        document.body.appendChild(this.navbar.getContainer());

        this.login = new Login();
        document.body.appendChild(this.login.getContainer());
    }

    destroy() {
        // destroy navbar
        this.navbar?.destroy();
        this.login?.destroy();

        // Remove DOM elements
        document.getElementById("navbar-container")?.remove();
        document.getElementById("login-container")?.remove();

        // Clear references
        this.navbar = null;
        this.login = null;
    }
}
