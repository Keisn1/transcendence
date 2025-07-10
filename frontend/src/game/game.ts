import { Ball } from './ball'
import { Paddle } from './paddle'

const canvas = document.getElementById("canvas")! as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

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
		ball.posX < 0 ? scores.player2++ : scores.player1++;
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

	ctx.font = "42px serif";
	ctx.fillText(`${scores.player1}`, canvas.width / 4.2, canvas.height / 10);
	ctx.fillText(`${scores.player2}`, canvas.width / 2 + canvas.width / 4.2, canvas.height / 10);

	requestAnimationFrame(gameLoop);
}

const delay = ms => new Promise(res => setTimeout(res, ms)); 

async function startTimer() {
	ctx.font = "200px serif";
	ctx.fillStyle = "#fff";

	for (let i = 0; i <= 3; ++i) {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.fillText(`${i}`, canvas.width / 2, canvas.height / 2);
		await delay(1000);
	}
}

// function checkGameOver() {
// 	if (scores.player1 === 10 || scores.player2 === 10) {

// 	}
// }

await startTimer();

gameLoop();
