import { Ball } from "./ball";
import { Paddle } from "./paddle";
// import normal from "@stdlib/random-base-normal";

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

const keys = new Map<string, boolean>([
    ["w", false],
    ["s", false],
    ["ArrowUp", false],
    ["ArrowDown", false],
]);

const setEventKeyTrue = (e: KeyboardEvent) => {
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();
    }
    keys.set(e.key, true);
};

const setEventKeyFalse = (e: KeyboardEvent) => {
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();
    }
    keys.set(e.key, false);
};

window.addEventListener("keydown", setEventKeyTrue);
window.addEventListener("keyup", setEventKeyFalse);

function handleInput(canvas: HTMLCanvasElement, leftPaddle: Paddle, rightPaddle: Paddle) {
    // W / S
    if (keys.get("w")) leftPaddle.moveUp(canvas);
    if (keys.get("s")) leftPaddle.moveDown(canvas);
    // ↑ / ↓
    if (keys.get("ArrowUp")) rightPaddle.moveUp(canvas);
    if (keys.get("ArrowDown")) rightPaddle.moveDown(canvas);
}

export interface GameConfig {
    winningScore?: number;
    vx?: number;
    vy?: number;
    ballRadius?: number;
    paddleSpeed?: number;
    colors?: {
        ball: string;
        paddle: string;
        background: string;
    };
}

export class PongGame {
    private canvas: HTMLCanvasElement;
    private config: Required<GameConfig>;
    private ctx: CanvasRenderingContext2D;
    private ball: Ball;
    private leftPaddle: Paddle;
    private rightPaddle: Paddle;
    private scores = { player1: 0, player2: 0 };
    private matchCount: number = 0;

    constructor(canvas: HTMLCanvasElement, config: GameConfig) {
        this.canvas = canvas;
        canvas.width = window.innerWidth * 0.8;
        canvas.height = window.innerHeight * 0.8;
        this.ctx = canvas.getContext("2d")!;
        this.config = {
            winningScore: config.winningScore ?? 10,
            vx: config.vx ?? 6,
            vy: config.vy ?? 6,
            ballRadius: config.ballRadius ?? 10,
            paddleSpeed: config.paddleSpeed ?? 7,
            colors: {
                ball: config.colors?.ball ?? "#fff",
                paddle: config.colors?.paddle ?? "#fff",
                background: config.colors?.background ?? "#000",
            },
        };

        this.ball = new Ball({
            posX: this.canvas.width / 2,
            posY: this.canvas.height / 2,
            radius: this.config.ballRadius,
            vx: this.config.vx,
            vy: this.config.vy,
            color: this.config.colors.ball,
        });

        this.leftPaddle = new Paddle({
            posX: 20,
            posY: (this.canvas.height - 100) / 2,
            width: 10,
            height: 100,
            speed: 5,
            color: this.config.colors.paddle,
        });

        this.rightPaddle = new Paddle({
            posX: this.canvas.width - 20 - 10,
            posY: (this.canvas.height - 100) / 2,
            width: 10,
            height: 100,
            speed: 5,
            color: this.config.colors.paddle,
        });
    }

    async start() {
        await this.startTimer();
        this.gameLoop();
    }

    private drawCenterLine() {
        const segmentHeight = 20;
        const gap = 10;
        for (let y = 0; y < this.canvas.height; y += segmentHeight + gap) {
            this.ctx.fillRect(this.canvas.width / 2 - 1, y, 2, segmentHeight);
        }
    }

    // Add these properties
    private leftPaddleCollision = false;
    private rightPaddleCollision = false;
    private checkPaddleCollision(paddle: Paddle) {
        let ball = this.ball;
        const ballLeft = ball.posX - ball.radius;
        const ballRight = ball.posX + ball.radius;
        const ballBottom = ball.posY + ball.radius;
        const ballTop = ball.posY - ball.radius;

        const paddleRightSide = paddle.posX + paddle.width;
        const paddleLeftSide = paddle.posX;
        const paddleTop = paddle.posY;
        const paddleBottom = paddle.posY + paddle.height;

        const isBallInsidePaddle = () => {
            return (
                ballLeft < paddleRightSide &&
                ballRight > paddleLeftSide &&
                ballBottom > paddleTop &&
                ballTop < paddleBottom
            );
        };

        const isLeftPaddle = paddle === this.leftPaddle;
        const hasCollided = isLeftPaddle ? this.leftPaddleCollision : this.rightPaddleCollision;
        if (isBallInsidePaddle() && !hasCollided) {
            // Set collision state
            if (isLeftPaddle) {
                this.leftPaddleCollision = true;
            } else {
                this.rightPaddleCollision = true;
            }

            const paddleCenterY = paddle.posY + paddle.height / 2;
            const relativeIntersectY = (ball.posY - paddleCenterY) / (paddle.height / 2); // in range pf -1 to 1

            const maxAngle = (45 * Math.PI) / 180;
            const theta = maxAngle * relativeIntersectY;

            const ballSpeed = Math.hypot(ball.vx, ball.vy);
            const xDirection = ball.vx < 0 ? 1 : -1;

            ball.vx = ballSpeed * Math.cos(theta) * xDirection;
            ball.vy = ballSpeed * Math.sin(theta);
        } else {
            // Reset collision state when ball is no longer inside paddle
            if (isLeftPaddle) {
                this.leftPaddleCollision = false;
            } else {
                this.rightPaddleCollision = false;
            }
        }
    }

    private resetBall() {
        let ball = this.ball;

        const speedMagnitude = 10;
        const angleRange = (60 * Math.PI) / 180;

        ball.posX = this.canvas.width / 2;
        ball.posY = this.canvas.height / 2;

        const xDirection = this.matchCount % 2 === 0 ? 1 : -1;

        const theta = (Math.random() - 0.5) * angleRange;

        ball.vx = speedMagnitude * Math.cos(theta) * xDirection;
        ball.vy = speedMagnitude * Math.sin(theta);
    }

    private checkGameFinished() {
        let ball = this.ball;
        let scores = this.scores;
        if (ball.posX < 0 || ball.posX > this.canvas.width) {
            ball.posX < 0 ? scores.player2++ : scores.player1++;
            this.matchCount++;
            this.resetBall();
        }
    }

    private async startTimer() {
        this.ctx.font = "200px serif";
        this.ctx.fillStyle = "#fff";

        for (let i = 0; i <= 3; ++i) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillText(`${i}`, this.canvas.width / 2, this.canvas.height / 2);
            await delay(100);
        }
    }

    private isGameOver(): boolean {
        if (this.scores.player1 >= 5 || this.scores.player2 >= 5) {
            removeEventListener("keydown", setEventKeyTrue);
            removeEventListener("keyup", setEventKeyFalse);
            for (let k of keys.keys()) keys.set(k, false);
            return true;
        }
        return false;
    }

    private gameLoop() {
        handleInput(this.canvas, this.leftPaddle, this.rightPaddle);
        this.checkPaddleCollision(this.leftPaddle);
        this.checkPaddleCollision(this.rightPaddle);
        this.checkGameFinished();

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); // clean previous drawings
        this.drawCenterLine();
        this.leftPaddle.draw(this.ctx);
        this.rightPaddle.draw(this.ctx);
        if (!this.isGameOver()) {
            this.ball.update(this.canvas);
            this.ball.draw(this.ctx);
        }

        this.ctx.font = "42px serif";
        this.ctx.fillText(`${this.scores.player1}`, this.canvas.width / 4.2, this.canvas.height / 10);
        this.ctx.fillText(
            `${this.scores.player2}`,
            this.canvas.width / 2 + this.canvas.width / 4.2,
            this.canvas.height / 10,
        );

        requestAnimationFrame(() => this.gameLoop());
    }
}
