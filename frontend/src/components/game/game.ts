import { Ball, type BallConfig } from "./ball";
import { Paddle, type Paddles } from "./paddle";
import { InputManager } from "./inputManager";
import { AiController } from "./aiController";

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

interface ControlsConfig {
    player1: { up: string; down: string };
    player2: { up: string; down: string };
}

export interface GameConfig {
    winningScore?: number;
    ballConfig?: BallConfig;
    paddleSpeed?: number;
    colors?: {
        paddle: string;
        background: string;
    };

    controls?: ControlsConfig;
}

export class PongGame {
    private inputManager: InputManager;
    private canvas: HTMLCanvasElement;
    private config: Required<GameConfig>;
    private ctx: CanvasRenderingContext2D;
    private ball: Ball;
    private paddles: Paddles;
    private scores = { player1: 0, player2: 0 };
    private rallyCount: number = 0;
    private leftAiController: AiController = new AiController();
    private rightAiController: AiController = new AiController();

    constructor(canvas: HTMLCanvasElement, config: GameConfig = {}) {
        const defaultControls: ControlsConfig = {
            player1: { up: "w", down: "s" },
            player2: { up: "ArrowUp", down: "ArrowDown" },
        };

        this.canvas = canvas;
        this.inputManager = new InputManager();

        canvas.width = window.innerWidth * 0.8;
        canvas.height = window.innerHeight * 0.8;
        this.ctx = canvas.getContext("2d")!;

        this.config = {
            ballConfig: {
                initPos: { x: canvas.width / 2, y: canvas.height / 2 },
                initDirection: { dx: 1, dy: 1 },
                radius: config.ballConfig?.radius ?? 10,
                speed: config.ballConfig?.speed ?? canvas.width / 3000,
                color: config.ballConfig?.color ?? "#fff",
            },
            winningScore: config.winningScore ?? 5,
            paddleSpeed: config.paddleSpeed ?? 7,
            colors: {
                paddle: config.colors?.paddle ?? "#fff",
                background: config.colors?.background ?? "#000",
            },
            controls: config.controls ?? defaultControls,
        };

        this.setupControls();
        this.ball = new Ball(this.config.ballConfig);
        this.paddles = {
            left: new Paddle({
                posX: 20,
                posY: (this.canvas.height - 100) / 2,
                width: 10,
                height: 100,
                speed: 5,
                color: this.config.colors.paddle,
            }),
            right: new Paddle({
                posX: this.canvas.width - 20 - 10,
                posY: (this.canvas.height - 100) / 2,
                width: 10,
                height: 100,
                speed: 5,
                color: this.config.colors.paddle,
            }),
        };
    }

    async start() {
        await this.startTimer();
        requestAnimationFrame((t) => this.gameLoop(t, 0));
    }

    private setupControls() {
        this.inputManager.bindKey(this.config.controls.player1.up, () => this.paddles.left.moveUp(this.canvas));
        this.inputManager.bindKey(this.config.controls.player1.down, () => this.paddles.left.moveDown(this.canvas));
        this.inputManager.bindKey(this.config.controls.player2.up, () => this.paddles.right.moveUp(this.canvas));
        this.inputManager.bindKey(this.config.controls.player2.down, () => this.paddles.right.moveDown(this.canvas));
    }

    private drawCenterLine() {
        const segmentHeight = 20;
        const gap = 10;
        for (let y = 0; y < this.canvas.height; y += segmentHeight + gap) {
            this.ctx.fillRect(this.canvas.width / 2 - 1, y, 2, segmentHeight);
        }
    }

    private resetBall() {
        let ball = this.ball;
        this.ball.speed = this.config.ballConfig.speed;
        this.nbrCollision = 0;

        const angleRange = (60 * Math.PI) / 180;

        ball.pos.x = this.canvas.width / 2;
        ball.pos.y = this.canvas.height / 2;

        const xDirection = this.rallyCount % 2 === 0 ? 1 : -1;

        const theta = (Math.random() - 0.5) * angleRange;

        ball.dir.dx = xDirection;
        ball.dir.dy = Math.sin(theta);
    }

    private isRallyFinished() {
        let ball = this.ball;
        let scores = this.scores;
        if (ball.pos.x < 0 || ball.pos.x > this.canvas.width) {
            ball.pos.x < 0 ? scores.player2++ : scores.player1++;
            return true;
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
        if (this.scores.player1 >= this.config.winningScore || this.scores.player2 >= this.config.winningScore) {
            this.destroy();
            return true;
        }
        return false;
    }

    private checkAiMovement() {
        this.leftAiController.prediction(this.ball, this.paddles.left, this.canvas);
        if (this.leftAiController.aiDir == "up") {
            this.paddles.left.moveUp(this.canvas);
        } else if (this.leftAiController.aiDir == "down") {
            this.paddles.left.moveDown(this.canvas);
        }
		this.rightAiController.prediction(this.ball, this.paddles.right, this.canvas);
        if (this.rightAiController.aiDir == "up") {
            this.paddles.right.moveUp(this.canvas);
        } else if (this.rightAiController.aiDir == "down") {
            this.paddles.right.moveDown(this.canvas);
        }
    }

    private drawNewState() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); // clean previous drawings
        this.drawCenterLine();
        this.paddles.left.draw(this.ctx);
        this.paddles.right.draw(this.ctx);
        if (!this.isGameOver()) {
            this.ball.draw(this.ctx);
        }

        this.ctx.font = "42px serif";
        this.ctx.fillText(`${this.scores.player1}`, this.canvas.width / 4.2, this.canvas.height / 10);
        this.ctx.fillText(
            `${this.scores.player2}`,
            this.canvas.width / 2 + this.canvas.width / 4.2,
            this.canvas.height / 10,
        );
    }

    // Add these properties
    private leftPaddleCollision = false;
    private rightPaddleCollision = false;
    private checkPaddleCollision(paddle: Paddle) {
        let ball = this.ball;

        const isLeftPaddle = paddle === this.paddles.left;
        const hasCollided = isLeftPaddle ? this.leftPaddleCollision : this.rightPaddleCollision;
        if (isBallInsidePaddle(ball, paddle) && !hasCollided) {
            // Set collision state
            if (isLeftPaddle) {
                this.leftPaddleCollision = true;
                return this.paddles.left;
            } else {
                this.rightPaddleCollision = true;
                return this.paddles.right;
            }
        } else {
            // Reset collision state when ball is no longer inside paddle
            if (isLeftPaddle) {
                this.leftPaddleCollision = false;
            } else {
                this.rightPaddleCollision = false;
            }
            return null;
        }
    }

    private nbrCollision: number = 0;
    private gameLoop(timestamp: number, lastTime: number) {
        if (lastTime === 0) {
            lastTime = timestamp;
        }
        const elapsed = timestamp - lastTime;

        this.inputManager.processInput();
        this.checkAiMovement();

        let paddle = this.checkPaddleCollision(this.paddles.left);
        if (!paddle) {
            paddle = this.checkPaddleCollision(this.paddles.right);
        }
        if (paddle) {
            this.nbrCollision++;
            if (this.nbrCollision == 1) {
                this.ball.speed *= 2;
            }
        }

        if (!this.isGameOver()) {
            if (paddle) {
                const paddleCenterY = paddle.posY + paddle.height / 2;
                const relativeIntersectY = (this.ball.pos.y - paddleCenterY) / (paddle.height / 2); // in range pf -1 to 1
                this.ball.updateCollision(relativeIntersectY);
            }
            this.ball.update(this.canvas, elapsed);
        }

        this.drawNewState();

        if (this.isRallyFinished()) {
            this.rallyCount++;
            this.resetBall();
        }

        requestAnimationFrame((t) => this.gameLoop(t, timestamp));
    }

    destroy() {
        this.inputManager.destroy();
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
