import AbstractView from "./AbstractView.ts";
import { Navbar } from "../components/navbar/navbar.ts";

export default class extends AbstractView {
	private navbar: Navbar | null = null;

	constructor(router?: any) {
		super(router);
		this.setTitle("Settings");
	}

	render() {
		this.navbar = new Navbar();
		document.body.appendChild(this.navbar.getContainer());

		const container = document.createElement("div");
		container.id = "settings-container";
		container.className = "mx-auto max-w-2xl mt-10 p-8 bg-white rounded-xl shadow";
		container.innerHTML = `
            <h1 class="text-3xl font-bold mb-6 text-gray-900">Settings</h1>
            <a
                data-link
                href="/settings/gdpr"
                class="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
                GDPR Settings
            </a>
        `;
		document.body.appendChild(container);
	}

	destroy() {
		this.navbar?.destroy();
		document.getElementById("navbar-container")?.remove();
		document.getElementById("settings-container")?.remove();
		this.navbar = null;
	}
}