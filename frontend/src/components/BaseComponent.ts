export interface Component {
    getContainer(): HTMLElement;
    destroy(): void;
    init?(): void | Promise<void>;
}

export abstract class BaseComponent implements Component {
    protected container: HTMLElement;
    protected eventListenerCleanups: (() => void)[] = [];

    constructor(elementType: string = "div", id?: string, classes?: string) {
        this.container = document.createElement(elementType);
        if (id) this.container.id = id;
        if (classes?.length) {
            this.container.classList.add(...classes.split(" "));
        }
    }

    getContainer(): HTMLElement {
        return this.container;
    }

    protected addEventListenerWithCleanup(
        element: HTMLElement,
        type: string,
        listener: EventListenerOrEventListenerObject,
    ): void {
        element.addEventListener(type, listener);
        this.eventListenerCleanups.push(() => {
            element.removeEventListener(type, listener);
        });
    }

    destroy(): void {
        this.eventListenerCleanups.forEach((cleanup) => cleanup());
        this.eventListenerCleanups = [];
    }
}
