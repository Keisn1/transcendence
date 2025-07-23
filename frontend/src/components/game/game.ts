import { Ball, type BallConfig } from "./ball";
import { Paddle, type Paddles, type PaddleConfig } from "./paddle";
import { InputManager } from "./inputManager";
import { AiController } from "./aiController";
import { type AiLevel } from "./gameControls";

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

interface ControlsConfig {
    player1: { up: string; down: string };
    player2: { up: string; down: string };
}

export interface GameConfig {
    winningScore?: number;
    ballConfig?: BallConfig;
    paddleConfig?: PaddleConfig;
    colors?: {
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
    private timePassed: number = 1000;
    private feedFrequency: number = 1000;
    private aiController: AiController | null = null;

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
                initDirection: { dx: 1, dy: -0.5 },
                radius: config.ballConfig?.radius ?? 10,
                speed: config.ballConfig?.speed ?? canvas.width / 3000,
                color: config.ballConfig?.color ?? "#fff",
            },
            paddleConfig: {
                speed: config.paddleConfig?.speed ?? 7,
                color: config.paddleConfig?.color ?? "#fff",
            },
            winningScore: config.winningScore ?? 5,
            colors: {
                background: config.colors?.background ?? "#000",
            },
            controls: config.controls ?? defaultControls,
        };

        this.setupControls();
        this.ball = new Ball(this.config.ballConfig);
        this.paddles = {
            left: new Paddle("left", this.config.paddleConfig, canvas),
            right: new Paddle("right", this.config.paddleConfig, canvas),
        };
    }

    public setAiLevel(level: AiLevel) {
        if (this.aiController) {
            this.aiController.destroy();
            this.aiController = null;
        }
        if (level !== "none") {
            if (level == "easy") this.feedFrequency = 1500; // not the best solution
            this.setupAi();
        }
    }

    private setupAi() {
        this.aiController = new AiController(this.paddles.right, this.canvas);
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

        for (let i = 3; i > 0; --i) {
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

    private checkCollision(): Paddle | null {
        if (this.paddles.right.collidesWithBall(this.ball)) return this.paddles.right;
        if (this.paddles.left.collidesWithBall(this.ball)) return this.paddles.left;
        return null;
    }

    private gameLoop(timestamp: number, lastTime: number) {
        if (lastTime === 0) {
            lastTime = timestamp;
        }
        const elapsed = timestamp - lastTime;

        this.inputManager.processInput();

        this.timePassed += elapsed;
        if (this.timePassed >= this.feedFrequency) {
            this.timePassed -= this.feedFrequency;
            if (this.aiController) this.aiController.feedAi(this.ball);
        }

        let collisionPaddle = this.checkCollision();
        if (!this.isGameOver()) {
            this.ball.update(this.canvas, collisionPaddle, elapsed);
        }

        this.drawNewState();

        if (this.isRallyFinished()) {
            this.rallyCount++;
            this.ball.reset(this.rallyCount);
        }

        requestAnimationFrame((t) => this.gameLoop(t, timestamp));
    }

    destroy() {
        this.inputManager.destroy();
        if (this.aiController) {
            this.aiController.destroy();
            this.aiController = null;
        }
    }
}
