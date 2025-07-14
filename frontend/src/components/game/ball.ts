export interface Direction {
    dx: number;
    dy: number;
}

interface Position {
    x: number;
    y: number;
}

export interface BallConfig {
    initPos: Position;
    initDirection: Direction; // was vx and vy
    speed: number;
    radius: number;
    color: string;
}

export class Ball {
    public pos: Position;
    public dir: Direction;
    public radius: number;
    public color: string;

    constructor(config: BallConfig) {
        this.pos = config.initPos;
        this.dir = config.initDirection;
        this.radius = config.radius;
        this.color = config.color;
    }

    update(canvas: HTMLCanvasElement) {
        this.pos.x += this.dir.dx;
        this.pos.y += this.dir.dy;
        if (this.pos.x - this.radius < 0 || this.pos.y + this.radius > canvas.height) {
            this.dir.dy *= -1; // bounce
        }
    }
    draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}
