import AbstractView from "./AbstractView.ts";
import { Navbar } from "../components/navbar/navbar.ts";
import { SignUp } from "../components/signup/signup.ts";
import type Router from "../router.ts";

export default class extends AbstractView {
    private navbar: Navbar | null = null;
    private signup: SignUp | null = null;

    constructor(router?: Router, params?: any[]) {
        super(router, params);
        this.setTitle("Sign Up");
    }

    render() {
        this.navbar = new Navbar();
        document.body.appendChild(this.navbar.getContainer());

        this.signup = new SignUp();
        document.body.appendChild(this.signup.getContainer());
    }

    destroy() {
        this.navbar?.destroy();
        this.signup?.destroy();

        document.getElementById("navbar-container")?.remove();
        document.getElementById("signup-container")?.remove();

        this.navbar = null;
        this.signup = null;
    }
}
