interface BallConfig {
    posX: number;
    posY: number;
    radius: number;
    vx: number;
    vy: number;
    color: string;
}

export class Ball {
    public posX: number;
    public posY: number;
    public radius: number;
    public vx: number;
    public vy: number;
    public color: string;

    constructor(config: BallConfig) {
        this.posX = config.posX;
        this.posY = config.posY;
        this.radius = config.radius;
        this.vx = config.vx;
        this.vy = config.vy;
        this.color = config.color;
    }

    update(canvas: HTMLCanvasElement, elapsed) {
        this.posX += this.vx * elapsed;
        this.posY += this.vy * elapsed;
        if (this.posY - this.radius < 0 || this.posY + this.radius > canvas.height) {
            this.vy *= -1; // bounce
        }
    }
    draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(this.posX, this.posY, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}
