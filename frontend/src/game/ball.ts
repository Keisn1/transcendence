import { Paddle } from "./paddle";

export interface BallDirection {
    dx: number;
    dy: number;
}

export interface BallPosition {
    x: number;
    y: number;
}

export interface BallConfig {
    initPos: BallPosition;
    initDirection: BallDirection; // was vx and vy
    speed: number;
    radius: number;
    color: string;
}

export class Ball {
    private config: BallConfig;
    public pos: BallPosition;
    public dir: BallDirection;
    public radius: number;
    public speed: number;
    public color: string;
    public nbrCollision: number = 0;

    constructor(config: BallConfig) {
        this.config = config;
        this.pos = { ...config.initPos };
        this.dir = { ...config.initDirection };
        this.speed = config.speed;
        this.radius = config.radius;
        this.color = config.color;
    }

    reset(rallyCount: number) {
        this.speed = this.config.speed;
        this.nbrCollision = 0;

        this.pos = { ...this.config.initPos };

        const angleRange = (60 * Math.PI) / 180;
        const xDirection = rallyCount % 2 === 0 ? 1 : -1;
        const theta = (Math.random() - 0.5) * angleRange;

        this.dir.dx = xDirection;
        this.dir.dy = Math.sin(theta);
    }

    updateCollision(paddle: Paddle) {
        const paddleCenterY = paddle.posY + paddle.height / 2;
        const relativeIntersectY = (this.pos.y - paddleCenterY) / (paddle.height / 2);
        const maxAngle = (45 * Math.PI) / 180;
        const theta = maxAngle * relativeIntersectY;

        // put ball on top of the paddle after collision
        if ((paddle.side ?? "") === "left") {
            this.dir.dx = 1;
            this.pos.x = paddle.posX + paddle.width + this.radius + 0.5;
        } else {
            this.dir.dx = -1;
            this.pos.x = paddle.posX - this.radius - 0.5;
        }

        this.dir.dy = Math.sin(theta);

        this.nbrCollision++;
        if (this.nbrCollision == 1) {
            this.speed *= 2;
        }
    }

    update(canvas: HTMLCanvasElement, collisionPaddle: Paddle | null, elapsed: number) {
        if (collisionPaddle) this.updateCollision(collisionPaddle);

        let dist = this.speed * elapsed;

        let directionNormalized = normalizeDirection(this.dir);
        this.pos.x += directionNormalized.dx * dist;
        this.pos.y += directionNormalized.dy * dist;

        let bottom = canvas.height;
        if (this.pos.y + this.radius >= bottom && this.dir.dy > 0) {
            this.pos.y -= this.pos.y + this.radius - bottom; //
            this.dir.dy *= -1; // bounce
        }

        let top = 0;
        if (this.pos.y - this.radius <= top && this.dir.dy < 0) {
            this.pos.y += this.pos.y - this.radius + top;
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

function normalizeDirection(direction: BallDirection): BallDirection {
    let norm = Math.hypot(direction.dx, direction.dy);
    return {
        dx: direction.dx / norm,
        dy: direction.dy / norm,
    };
}
