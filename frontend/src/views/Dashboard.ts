import AbstractView from "./AbstractView.ts";
import "../templates/navbar/navbar.ts";

export default class extends AbstractView {
    constructor() {
        super();
        this.setTitle("Dashboard");
    }

    render() {
        return `<h1>Welcome back, Dom</h1>
<p>lorem ipsum</p>
<p>
<a href="/posts" data-link>View recent posts</a>.
</p>
`;
    }
}
