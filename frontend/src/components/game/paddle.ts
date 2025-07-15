import { Ball } from "./ball";

export interface Paddles {
    left: Paddle;
    right: Paddle;
}

export interface PaddleConfig {
    speed: number;
    color: string;
}

export class Paddle {
    public width: number;
    public height: number;
    public speed: number;
    public posX: number;
    public posY: number;
    public color: string;
    public side: string;
    private justCollided: boolean = false;

    constructor(side: string, config: PaddleConfig, canvas: HTMLCanvasElement) {
        this.side = side;
        this.speed = config.speed;
        this.color = config.color;

        this.width = Math.round(canvas.width / 125);
        this.height = Math.round(canvas.height / 7);

        this.posY = Math.round((canvas.height - this.height) / 2);

        if (this.side === "left") {
            this.posX = Math.round(canvas.width / 60);
        } else {
            this.posX = canvas.width - Math.round(canvas.width / 60) - this.width;
        }
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

    collidesWithBall(ball: Ball): boolean {
        if (isBallInsidePaddle(ball, this) && !this.justCollided) {
            this.justCollided = true;
            return true;
        }
        this.justCollided = false;
        return false;
    }
}

function isBallInsidePaddle(ball: Ball, paddle: Paddle) {
    const ballLeft = ball.pos.x - ball.radius;
    const ballRight = ball.pos.x + ball.radius;
    const ballBottom = ball.pos.y + ball.radius;
    const ballTop = ball.pos.y - ball.radius;

    const paddleRightSide = paddle.posX + paddle.width;
    const paddleLeftSide = paddle.posX;
    const paddleTop = paddle.posY;
    const paddleBottom = paddle.posY + paddle.height;

    return ballLeft < paddleRightSide && ballRight > paddleLeftSide && ballBottom > paddleTop && ballTop < paddleBottom;
}
