import { Ball } from "./ball";
import { Paddle } from "./paddle";

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

const keys = new Map<string, boolean>([
    ["w", false],
    ["s", false],
    ["ArrowUp", false],
    ["ArrowDown", false],
]);

const setEventKeyTrue = (e: KeyboardEvent) => {
    keys.set(e.key, true);
};

const setEventKeyFalse = (e: KeyboardEvent) => {
    keys.set(e.key, false);
};

window.addEventListener("keydown", setEventKeyTrue);
window.addEventListener("keyup", setEventKeyFalse);

function handleInput(canvas: HTMLCanvasElement, leftPaddle: Paddle, rightPaddle: Paddle) {
    // W / S
    if (keys.get("w")) leftPaddle.move(canvas, -leftPaddle.speed);
    if (keys.get("s")) leftPaddle.move(canvas, leftPaddle.speed);
    // ↑ / ↓
    if (keys.get("ArrowUp")) rightPaddle.move(canvas, -rightPaddle.speed);
    if (keys.get("ArrowDown")) rightPaddle.move(canvas, rightPaddle.speed);
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

    constructor(canvas: HTMLCanvasElement, config: GameConfig) {
        this.canvas = canvas;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        this.ctx = canvas.getContext("2d")!;
        this.config = {
            winningScore: config.winningScore ?? 10,
            vx: config.vx ?? 6,
            vy: config.vy ?? 6,
            ballRadius: config.ballRadius ?? 10,
            paddleSpeed: config.paddleSpeed ?? 5,
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

        if (isBallInsidePaddle()) {
            ball.vx *= -1;
            ball.vy = Math.round(Math.random() * 4 + 2);
        }
    }

    private checkGameFinished() {
        let ball = this.ball;
        let scores = this.scores;
        if (ball.posX < 0 || ball.posX > this.canvas.width) {
            ball.posX < 0 ? scores.player2++ : scores.player1++;
            ball.posX = this.canvas.width / 2;
            ball.posY = this.canvas.height / 2;
            ball.vx *= -1;
            console.log(scores);
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
