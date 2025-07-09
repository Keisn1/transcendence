const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width  = window.innerWidth / 2;
canvas.height = window.innerHeight / 2;

class Ball {
	constructor(x, y, radius, vx, vy) {
		this.x = x; this.y = y;
		this.radius = radius;
		this.vx = vx; this.vy = vy;
	}
	update() {
		this.x += this.vx;
		this.y += this.vy;
		if (this.y - this.radius < 0 || this.y + this.radius > canvas.height) {
		this.vy *= -1; // bounce
		}
	}
	draw() {
		ctx.beginPath();
		ctx.fillStyle = '#fff';
		ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2);
		ctx.fill();
	}
}

class Paddle {
	constructor(x) {
		this.width = 10; this.height = 100;
		this.x = x;
		this.y = (canvas.height - this.height)/2;
		this.speed = 5;
	}
	move(dy) {
		this.y = Math.max(0, Math.min(canvas.height - this.height, this.y + dy));
	}
	draw() {
		ctx.fillStyle = '#fff';
		ctx.fillRect(this.x, this.y, this.width, this.height);
	}
}

const ball   = new Ball(canvas.width / 2, canvas.height / 2, 10, 2, 2); // x position, y position, radius, x velocity, y velocity
const leftP  = new Paddle(20); // 20 pixels away from left boarder
const rightP = new Paddle(canvas.width - 20 - 10); // 20 pixels away from right boarder + 10 pixels for paddel width

const keys = {};
window.addEventListener('keydown', e => { keys[e.key] = true; });
window.addEventListener('keyup',   e => { keys[e.key] = false; });

function handleInput() { // moving paddels
// W / S
if (keys['w']) leftP.move(-leftP.speed);
if (keys['s']) leftP.move(leftP.speed);
// ↑ / ↓
if (keys['ArrowUp'])   rightP.move(-rightP.speed);
if (keys['ArrowDown']) rightP.move(rightP.speed);
}

function checkPaddleCollision(paddle) {
	if (
		ball.x - ball.radius < paddle.x + paddle.width &&
		ball.x + ball.radius > paddle.x &&
		ball.y + ball.radius > paddle.y &&
		ball.y - ball.radius < paddle.y + paddle.height
	) {
		ball.vx *= -1;
	}
}

function gameLoop() {
ball.update();
handleInput();
checkPaddleCollision(leftP);
checkPaddleCollision(rightP);

ctx.clearRect(0, 0, canvas.width, canvas.height); // clean previous drawings
ball.draw();
leftP.draw();
rightP.draw();

requestAnimationFrame(gameLoop);
}

gameLoop();