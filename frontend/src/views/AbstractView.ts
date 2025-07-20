import type Router from "../router";

export default class {
    protected router?: Router;

    constructor(router?: Router) {
        this.router = router;
    }

    setTitle(title: string) {
        document.title = title;
    }

    render() {}
    destroy() {}
}
