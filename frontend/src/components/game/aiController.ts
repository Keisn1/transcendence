import { Ball, type Direction, type Position } from "./ball"
import { Paddle } from "./paddle"

interface Intersection {
	x: number;
	y: number;
}

function getKeyCode(key: string): string {
    const keyCodeMap: Record<string, string> = {
        'w': 'KeyW',
        's': 'KeyS',
        'a': 'KeyA',
        'd': 'KeyD',
        'ArrowUp': 'ArrowUp',
        'ArrowDown': 'ArrowDown',
        'ArrowLeft': 'ArrowLeft',
        'ArrowRight': 'ArrowRight',
        ' ': 'Space',
        'Enter': 'Enter'
    };
    
    return keyCodeMap[key] || `Key${key.toUpperCase()}`;
}

function getKeyCodeNumber(key: string): number {
    const keyCodeMap: Record<string, number> = {
        'ArrowUp': 38,
        'ArrowDown': 40,
        'ArrowLeft': 37,
        'ArrowRight': 39,
        ' ': 32, // Space
        'Enter': 13
    };
    
    return keyCodeMap[key] || key.charCodeAt(0);
}

export class AiController {
	private paddle: Paddle;
	private canvas: HTMLCanvasElement;
	public aiDir:  "up" | "down" | "rest" = "rest";
	private lastPredictionTime = 0;
	private intersection: Intersection = {y: 0, x: 0};


	constructor(paddle: Paddle, canvas: HTMLCanvasElement) {
		this.paddle = paddle;
		this.canvas = canvas;
	}

	private predictYIntersection(pos: Position, dir: Direction, canvasHeight:number, intersectionX:number): number {
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

	private prediction(ball: Ball) {
		const paddle = this.paddle;
		const canvas = this.canvas;
		const now = performance.now();
		const movingTowards =
			(paddle.posX < canvas.width / 2  && ball.dir.dx < 0) ||
			(paddle.posX > canvas.width / 2 && ball.dir.dx > 0);

		if (!movingTowards) {
			this.intersection.y = canvas.height / 2;
		} else if (now - this.lastPredictionTime >= 1000) {
			this.lastPredictionTime = now;
			this.intersection.x = (paddle.side === "left") ? paddle.posX + paddle.width : paddle.posX;
			this.intersection.y = this.predictYIntersection(ball.pos, ball.dir, canvas.height, this.intersection.x);
		}
	}

	private simulateKeyEvent(key: string, type: string) {
		// console.log(getKeyCode(key));
		let event = new KeyboardEvent(type, {
			key: key,
			code: getKeyCode(key),
			keyCode: getKeyCodeNumber(key),
			bubbles: true
		});
		document.dispatchEvent(event);
	}

	private pressKey() {
		if (this.paddle.side === "left") {
			if (this.aiDir == "up") {
				this.simulateKeyEvent('w', 'keydown');
			} else if (this.aiDir == "down") {
				this.simulateKeyEvent('s', 'keydown');
			} else if (this.aiDir == "rest") {
				this.simulateKeyEvent('w', 'keyup');
				this.simulateKeyEvent('s', 'keyup');
			}
		}
		if (this.paddle.side === "right") {
			if (this.aiDir == "up") {
				this.simulateKeyEvent('ArrowUp', 'keydown');
			} else if (this.aiDir == "down") {
				this.simulateKeyEvent('ArrowDown', 'keydown');
			} else if (this.aiDir == "rest") {
				this.simulateKeyEvent('ArrowUp', 'keyup');
				this.simulateKeyEvent('ArrowDown', 'keyup');
			}
		}
	}

	public feedAi(ball: Ball) {
		this.prediction(ball);
		this.updateDirection();
		this.pressKey();
	}
}