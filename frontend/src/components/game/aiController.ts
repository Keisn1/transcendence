import { Ball } from "./ball"
import { Paddle } from "./paddle"
import { predictYIntersection } from "./aiOpponent"

interface Intersection {
	x: number;
	y: number;
}

export class AiController {
	public aiDir:  "up" | "down" | "rest" = "rest";
	private lastPredictionTime = 0;
	private intersection: Intersection = {y: 0, x: 0};

	constructor() {}

	public prediction(ball: Ball, paddle: Paddle, canvas: HTMLCanvasElement) {
		const now = performance.now();
		const paddleCenter = paddle.posY + paddle.height / 2;
		const movingTowards =
			(paddle.posX < canvas.width / 2  && ball.dir.dx < 0) ||
			(paddle.posX > canvas.width / 2 && ball.dir.dx > 0);

		if (!movingTowards) {
			this.intersection.y = canvas.height / 2;
		} else if (now - this.lastPredictionTime >= 1000) {
			this.lastPredictionTime = now;
			this.intersection.x = (paddle.posX < canvas.width / 2) ? paddle.posX + paddle.width : paddle.posX;
			this.intersection.y = predictYIntersection(ball.pos, ball.dir, canvas.height, this.intersection.x);
		}

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
}