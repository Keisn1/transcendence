import type Router from "../router";

export default class {
    protected router?: Router;
    protected params?: any[];

    constructor(router?: Router, params?: any[]) {
        this.router = router;
        this.params = params;
    }

    setTitle(title: string) {
        document.title = title;
    }

    render() {}
    destroy() {}
}
