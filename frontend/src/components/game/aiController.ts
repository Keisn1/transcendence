import { Ball } from "./ball"
import { Paddle } from "./paddle"
import { predictYIntersection } from "./aiOpponent"

interface Intersection {
	x: number;
	y: number;
}

export class AiController {
	public aiDir:  "up" | "down" | "rest" = "rest";

	constructor() {}

	public prediction(ball: Ball, paddle: Paddle, canvasHeight: number) {
		const paddleCenter = paddle.posY + paddle.height / 2;
		let intersection: Intersection = { x: paddle.posX + paddle.width, y: 0 };
		intersection.y = predictYIntersection(ball.pos, ball.dir, canvasHeight, intersection.x);

		console.log(intersection.y);
		// if the intersection.y is outside of the paddle
		if (Math.abs(intersection.y - paddleCenter) > paddle.height / 2) {
			// if intersection.y is upper paddleCentre 
			if (intersection.y < paddleCenter) {
				this.aiDir = "up";
			}
			// if intersection.y is lower paddleCentre 
			if (intersection.y > paddleCenter) {
				this.aiDir = "down";
			}
		} else {
			this.aiDir = "rest";
		}
	}
}