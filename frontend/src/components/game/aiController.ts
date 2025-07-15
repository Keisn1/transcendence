import { Ball, type Direction, type Position } from "./ball"
import { Paddle } from "./paddle"

interface Intersection {
	x: number;
	y: number;
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

	public prediction(ball: Ball) {
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
			this.intersection.x = (paddle.posX < canvas.width / 2) ? paddle.posX + paddle.width : paddle.posX;
			this.intersection.y = this.predictYIntersection(ball.pos, ball.dir, canvas.height, this.intersection.x);
		}
	}

	public feedAi(ball: Ball) {
		this.prediction(ball);
		this.updateDirection();
	}
}