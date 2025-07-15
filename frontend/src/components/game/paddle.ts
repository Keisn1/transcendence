export interface Paddles {
    left: Paddle;
    right: Paddle;
}

interface PaddleConfig {
    posX: number;
    posY: number;
    width: number;
    height: number;
    speed: number;
    color: string;
    side: string;
}

export class Paddle {
    public width: number;
    public height: number;
    public speed: number;
    public posX: number;
    public posY: number;
    public color: string;
    public side: string;

    constructor(config: PaddleConfig) {
        this.posX = config.posX;
        this.posY = config.posY;
        this.width = config.width;
        this.height = config.height;
        this.speed = config.speed;
        this.color = config.color;
        this.side = config.side;
    }

    moveUp(canvas: HTMLCanvasElement) {
        this.posY = Math.max(0, Math.min(canvas.height - this.height, this.posY - this.speed));
    }

    moveDown(canvas: HTMLCanvasElement) {
        this.posY = Math.max(0, Math.min(canvas.height - this.height, this.posY + this.speed));
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = "#fff";
        ctx.fillRect(this.posX, this.posY, this.width, this.height);
    }
}
