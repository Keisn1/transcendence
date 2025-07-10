import Ball from './ball.ts'

const canvas = document.getElementById("canvas")! as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
canvas.width = window.innerWidth / 2;
canvas.height = window.innerHeight / 2;

class Paddle {
	public width: number = 10;
	public height: number = 100;
	public speed: number = 5;
	public posX: number;
	public posY: number = (canvas.height - this.height) / 2;

	constructor(x: number) {
		this.posX = x;
	}
	move(dy: number) {
		this.posY = Math.max(
			0,
			Math.min(canvas.height - this.height, this.posY + dy),
		);
	}
	draw() {
		ctx.fillStyle = "#fff";
		ctx.fillRect(this.posX, this.posY, this.width, this.height);
	}
}

const ball = new Ball(canvas.width / 2, canvas.height / 2, 10, 2, 2); // x position, y position, radius, x velocity, y velocity
const leftP = new Paddle(20); // 20 pixels away from left boarder
const rightP = new Paddle(canvas.width - 20 - 10); // 20 pixels away from right boarder + 10 pixels for paddel width

const keys = new Map<string, boolean>([
	["w", false],
	["s", false],
	["ArrowUp", false],
	["ArrowDown", false],
]);

window.addEventListener("keydown", (e) => {
	keys.set(e.key, true);
});
window.addEventListener("keyup", (e) => {
	keys.set(e.key, false);
});

function handleInput() {
	// moving paddels
	// W / S
	if (keys.get("w")) leftP.move(-leftP.speed);
	if (keys.get("s")) leftP.move(leftP.speed);
	// ↑ / ↓
	if (keys.get("ArrowUp")) rightP.move(-rightP.speed);
	if (keys.get("ArrowDown")) rightP.move(rightP.speed);
}

function checkPaddleCollision(paddle: Paddle) {
	//
	if (
		ball.posX - ball.radius < paddle.posX + paddle.width &&
		ball.posX + ball.radius > paddle.posX &&
		ball.posY + ball.radius > paddle.posY &&
		ball.posY - ball.radius < paddle.posY + paddle.height
	) {
		ball.vx *= -1;
	}
}

function checkGameFinished() {
	if (ball.posX < 0 || ball.posX > canvas.width) {
		ball.posX = canvas.width / 2;
		ball.posY = canvas.height / 2;
		ball.vx *= -1;
	}
}

function gameLoop() {
	ball.update(canvas);
	handleInput();
	checkPaddleCollision(leftP);
	checkPaddleCollision(rightP);
	checkGameFinished();

	ctx.clearRect(0, 0, canvas.width, canvas.height); // clean previous drawings
	ball.draw(ctx);
	leftP.draw();
	rightP.draw();

	requestAnimationFrame(gameLoop);
}

gameLoop();
