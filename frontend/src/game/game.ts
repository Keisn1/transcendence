import { Ball } from './ball'
import { Paddle } from './paddle'

const canvas = document.getElementById("canvas")! as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
canvas.width = window.innerWidth / 2;
canvas.height = window.innerHeight / 2;

const ballConfig = {
	posX: canvas.width / 2,
	posY: canvas.height / 2,
	radius: 10,
	vx: 2,
	vy: 2,
	color: "#fff"
};

const leftPaddleConfig = {
	posX: 20,
	posY: (canvas.height - 100) / 2,
	width: 10,
	height: 100,
	speed: 5,
	color: "#fff"
}

const scores = {
	player1: 0,
	player2: 0
}

const rightPaddleConfig = {...leftPaddleConfig};
rightPaddleConfig.posX = canvas.width - 20 - 10;

const ball = new Ball(ballConfig);
const leftP = new Paddle(leftPaddleConfig);
const rightP = new Paddle(rightPaddleConfig);

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
	// W / S
	if (keys.get("w")) leftP.move(canvas, -leftP.speed);
	if (keys.get("s")) leftP.move(canvas, leftP.speed);
	// ↑ / ↓
	if (keys.get("ArrowUp")) rightP.move(canvas, -rightP.speed);
	if (keys.get("ArrowDown")) rightP.move(canvas, rightP.speed);
}

function checkPaddleCollision(paddle: Paddle) {
	const ballLeft = ball.posX - ball.radius;
	const ballRight = ball.posX + ball.radius;
	const ballBottom = ball.posY + ball.radius;
	const ballTop = ball.posY - ball.radius;

	const paddleRight = paddle.posX + paddle.width;
	const paddleLeft = paddle.posX;
	const paddleTop = paddle.posY;
	const paddleBottom = paddle.posY + paddle.height;

	const isBallInsidePaddle = () => {
		return ballLeft < paddleRight &&
		ballRight > paddleLeft &&
		ballBottom > paddleTop &&
		ballTop < paddleBottom;
	}

	if (isBallInsidePaddle()) {
		ball.vx *= -1;
	}
}

function checkGameFinished() {
	if (ball.posX < 0 || ball.posX > canvas.width) {
		ball.posX < 0 ? scores.player1++ : scores.player2++;
		ball.posX = canvas.width / 2;
		ball.posY = canvas.height / 2;
		ball.vx *= -1;
		console.log(scores);
	}
}

function drawCenterLine(ctx:CanvasRenderingContext2D, canvas:HTMLCanvasElement) {
	const segmentHeight = 20, gap = 10;
	for (let y = 0; y < canvas.height; y += segmentHeight + gap) {
		ctx.fillRect(canvas.width/2 - 1, y, 2, segmentHeight);
	}
}

function gameLoop() {
	ball.update(canvas);
	handleInput();
	checkPaddleCollision(leftP);
	checkPaddleCollision(rightP);
	checkGameFinished();

	ctx.clearRect(0, 0, canvas.width, canvas.height); // clean previous drawings
	drawCenterLine(ctx, canvas);
	ball.draw(ctx);
	leftP.draw(ctx);
	rightP.draw(ctx);

	requestAnimationFrame(gameLoop);
}

gameLoop();
