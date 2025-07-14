export interface Direction {
    dx: number;
    dy: number;
}

interface Position {
    x: number;
    y: number;
}

function normalizeDirection(direction: Direction): Direction {
    let norm = Math.hypot(direction.dx, direction.dy);
    return {
        dx: direction.dx / norm,
        dy: direction.dy / norm,
    };
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
    public speed: number;
    public color: string;

    constructor(config: BallConfig) {
        this.pos = config.initPos;
        this.dir = config.initDirection;
        this.speed = config.speed;
        this.radius = config.radius;
        this.color = config.color;
    }

    update(canvas: HTMLCanvasElement, elapsed: number) {
        let dist = this.speed * elapsed;

        let directionNormalized = normalizeDirection(this.dir);
        this.pos.x += directionNormalized.dx * dist;
        this.pos.y += directionNormalized.dy * dist;

        // if (this.pos.y - this.radius < 0 || this.pos.y + this.radius > canvas.height) {
        //     this.dir.dy *= -1; // bounce
        // }

        let bottom = canvas.height;
        if (this.pos.y + this.radius >= bottom) {
            this.pos.y = bottom - (this.pos.y + this.radius - bottom);
            // bottom = 1000
            // pos.y = 998
            // I think we want pos.y = 996
            // radius = 6
            // 998 + 6 = 1004 >= 1000
            // 1000 - (998 + 6 - 1000) = 996
            this.dir.dy *= -1; // bounce
        }

        if (this.pos.y - this.radius <= 0) {
            this.pos.y = -(this.pos.y - this.radius);
            this.dir.dy *= -1; // bounce
        }

        // // let top = 0;
        // // if (this.pos.y + this.radius < bottom) {
        // //     this.pos.y = bottom - (this.pos.y - bottom);
        // //     this.dir.dy *= -1; // bounce
        // // }
    }
    draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}
