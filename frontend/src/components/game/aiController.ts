import { Ball, type BallDirection, type BallPosition } from "./ball";
import { Paddle } from "./paddle";

interface Intersection {
    x: number;
    y: number;
}

interface BallData {
	dir: BallDirection;
	pos: BallPosition;
}

function getKeyCode(key: string): string {
    const keyCodeMap: Record<string, string> = {
        w: "KeyW",
        s: "KeyS",
        ArrowUp: "ArrowUp",
        ArrowDown: "ArrowDown",
    };

    return keyCodeMap[key] || `Key${key.toUpperCase()}`;
}

function getKeyCodeNumber(key: string): number {
    const keyCodeMap: Record<string, number> = {
        ArrowUp: 38,
        ArrowDown: 40,
        ArrowLeft: 37,
        ArrowRight: 39,
    };

    return keyCodeMap[key] || key.charCodeAt(0);
}

export class AiController {
    private paddle: Paddle;
    private canvas: HTMLCanvasElement;
    private aiDir: "up" | "down" | "rest" = "rest";
    private intersection: Intersection = { y: 0, x: 0 };
    private ballData: BallData | null = null;
    private isRunning: boolean = false;
    private actionLoop: number | null = null;

    constructor(paddle: Paddle, canvas: HTMLCanvasElement) {
        this.paddle = paddle;
        this.canvas = canvas;
        this.startAiLoop();
    }

    public feedAi(ball: Ball) {
        this.ballData = {
            pos: { ...ball.pos },
            dir: { ...ball.dir }
        };
    }

	private startAiLoop() {
        this.isRunning = true;
        
        const aiTick = () => {
            if (!this.isRunning) return;
            
            if (this.ballData) {
                this.prediction(this.ballData);
                this.updateDirection();
            }
            
            this.pressKey();
            this.actionLoop = requestAnimationFrame(aiTick);
        };
        
        aiTick();
    }

	private updateDirection() {
        const paddle = this.paddle;
        const paddleCenter = paddle.posY + paddle.height / 2;

        if (Math.abs(this.intersection.y - paddleCenter) > paddle.height / 2) {
            if (this.intersection.y < paddleCenter) {
                this.aiDir = "up";
            }
            if (this.intersection.y > paddleCenter) {
                this.aiDir = "down";
            }
        } else {
            this.aiDir = "rest";
        }
    }

    private prediction(ballData: BallData) {
        const paddle = this.paddle;
        const canvas = this.canvas;

        const movingTowards =
            (paddle.side === "left" && ballData.dir.dx < 0) || 
            (paddle.side === "right" && ballData.dir.dx > 0);

        if (movingTowards) {
            this.intersection.x = paddle.side === "left" ? 
                paddle.posX + paddle.width : paddle.posX;
            this.intersection.y = this.predictYIntersection(
                ballData.pos, ballData.dir, canvas.height, this.intersection.x
            );
        } else {
            this.intersection.y = canvas.height / 2;
        }
    }

	private predictYIntersection(
        pos: BallPosition,
        dir: BallDirection,
        canvasHeight: number,
        intersectionX: number,
    ): number {
        const initialBounceY = dir.dy > 0 ? 0 : canvasHeight;
        const stepsInDy = (pos.y - initialBounceY) / dir.dy;
        const initialBounceX = pos.x - dir.dx * stepsInDy;
        const nextBounceY = canvasHeight - initialBounceY;
        const tLeg = canvasHeight / Math.abs(dir.dy);
        const spanX = Math.abs(dir.dx) * tLeg;
        let dx = Math.abs(initialBounceX - intersectionX);
        const k = Math.floor(dx / spanX);
        const m = dx - k * spanX;
        const f = m / spanX;
        let yHit = initialBounceY + (nextBounceY - initialBounceY) * f;
        if (k % 2 === 1) yHit = canvasHeight - yHit;

        return yHit;
    }

    private simulateKeyEvent(key: string, type: string) {
        let event = new KeyboardEvent(type, {
            key: key,
            code: getKeyCode(key),
            keyCode: getKeyCodeNumber(key),
            bubbles: true,
        });
        document.dispatchEvent(event);
    }

	private pressKey() {
		let keyUp = "w";
		let keyDown = "s";
		if (this.paddle.side === "right") {
			keyUp = "ArrowUp";
			keyDown = "ArrowDown";
		}
		if (this.aiDir === "up") {
			this.simulateKeyEvent(keyDown, "keyup");
			this.simulateKeyEvent(keyUp,   "keydown");
		}
		else if (this.aiDir === "down") {
			this.simulateKeyEvent(keyUp,   "keyup");
			this.simulateKeyEvent(keyDown, "keydown");
		}
		else if (this.aiDir === "rest") {
			this.simulateKeyEvent(keyUp,   "keyup");
			this.simulateKeyEvent(keyDown, "keyup");
		}
	}

    destroy() {
        this.isRunning = false;
        if (this.actionLoop) {
            cancelAnimationFrame(this.actionLoop);
        }
    }
}
