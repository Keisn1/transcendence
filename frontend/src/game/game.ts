import { Ball, type BallConfig } from "./ball";
import { Paddle, type Paddles, type PaddleConfig } from "./paddle";
import { InputManager } from "./inputManager";
import { AiController } from "./aiController";
import { type MatchResult } from "../types/match.types";
import type { AiDifficulty } from "../types/game.types";

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
    private gameFont = { large: "200px monospace", normal: "42px monospace" };
    private paused: boolean = false;
    private justPaused = false;
    private requestAnimationFrame: number | null = null;
    private result: MatchResult;
    private onFinishCallback?: () => void;

    constructor(canvas: HTMLCanvasElement, config: GameConfig = {}, onFinish?: () => void) {
        this.onFinishCallback = onFinish;
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

        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        this.result = { player1Score: 0, player2Score: 0 };
    }

    public setAiDifficulty(difficulty: AiDifficulty | null) {
        if (this.aiController) {
            this.aiController.destroy();
            this.aiController = null;
        }

        if (difficulty) {
            if (difficulty === "easy") this.feedFrequency = 1300;
            this.setupAi();
        }
    }

    private setupAi() {
        this.aiController = new AiController(this.paddles.right, this.canvas);
    }

    async start() {
        await this.startTimer();
        this.requestAnimationFrame = requestAnimationFrame((t) => this.gameLoop(t, 0));
    }

    private togglePause() {
        this.paused = !this.paused;
        this.justPaused = this.paused;
    }

    private setupControls() {
        const c = this.config.controls;
        this.inputManager.bindKey(c.player1.up, () => this.paddles.left.moveUp(this.canvas));
        this.inputManager.bindKey(c.player1.down, () => this.paddles.left.moveDown(this.canvas));
        this.inputManager.bindKey(c.player2.up, () => this.paddles.right.moveUp(this.canvas));
        this.inputManager.bindKey(c.player2.down, () => this.paddles.right.moveDown(this.canvas));
        this.inputManager.bindKey("p", () => this.togglePause(), "once");
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
        this.ctx.font = this.gameFont.large;
        this.ctx.fillStyle = "#fff";

        for (let i = 3; i > 0; --i) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillText(`${i}`, this.canvas.width / 2, this.canvas.height / 2);
            await delay(100);
        }
    }

    private isGameOver(): boolean {
        const p1Score = this.scores.player1;
        const p2Score = this.scores.player2;
        const winScore = this.config.winningScore;
        let winMessage: string = p1Score > p2Score ? "player 1 wins" : "player 2 wins";

        if (p1Score >= winScore || p2Score >= winScore) {
            this.destroy();
            this.ctx.font = this.gameFont.normal;
            this.ctx.fillStyle = "rgba(0, 0, 0, 0.42)";
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = "#fff";
            this.ctx.fillText(winMessage, this.canvas.width / 2, this.canvas.height / 2);
            this.result = { player1Score: p1Score, player2Score: p2Score };

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

        this.ctx.font = this.gameFont.normal;
        this.ctx.fillText(`${this.scores.player1}`, this.canvas.width / 4, this.canvas.height / 16);
        this.ctx.fillText(`${this.scores.player2}`, (3 * this.canvas.width) / 4, this.canvas.height / 16);
    }

    private checkCollision(): Paddle | null {
        if (this.paddles.right.collidesWithBall(this.ball)) return this.paddles.right;
        if (this.paddles.left.collidesWithBall(this.ball)) return this.paddles.left;
        return null;
    }

    private showPauseScreen() {
        if (this.justPaused) {
            this.ctx.fillStyle = "rgba(0,0,0,0.5)";
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.justPaused = false;
        }
        this.ctx.font = this.gameFont.normal;
        this.ctx.fillStyle = "#fff";
        this.ctx.fillText("Paused", this.canvas.width / 2, this.canvas.height / 2);
    }

    private gameLoop(timestamp: number, lastTime: number) {
        this.inputManager.processInput(this.paused);
        if (this.paused) {
            this.showPauseScreen();
            requestAnimationFrame((t) => this.gameLoop(t, timestamp));
            return;
        }

        if (lastTime === 0) lastTime = timestamp;
        const elapsed = timestamp - lastTime;

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
        if (this.isGameOver()) {
            console.log("exiting game loop");

            // Call the finish callback
            if (this.onFinishCallback) {
                this.onFinishCallback();
            }

            return;
        }

        if (this.isRallyFinished()) {
            this.rallyCount++;
            this.ball.reset(this.rallyCount);
        }

        this.requestAnimationFrame = requestAnimationFrame((t) => this.gameLoop(t, timestamp));
    }

    public getResult(): MatchResult {
        return this.result;
    }

    destroy() {
        if (this.requestAnimationFrame !== null) {
            cancelAnimationFrame(this.requestAnimationFrame);
            this.requestAnimationFrame = null;
        }
        this.inputManager.destroy();
        this.aiController?.destroy();
        this.aiController = null;
    }
}
