export default class Ball {
	public posX: number;
	public posY: number;
	public radius: number;
	public vx: number;
	public vy: number;

	constructor(x: number, y: number, radius: number, vx: number, vy: number) {
		this.posX = x;
		this.posY = y;
		this.radius = radius;
		this.vx = vx;
		this.vy = vy;
	}
	update(canvas:HTMLCanvasElement) {
		this.posX += this.vx;
		this.posY += this.vy;
		if (
			this.posY - this.radius < 0 ||
			this.posY + this.radius > canvas.height
		) {
			this.vy *= -1; // bounce
		}
	}
	draw(ctx:CanvasRenderingContext2D) {
		ctx.beginPath();
		ctx.fillStyle = "#fff";
		ctx.arc(this.posX, this.posY, this.radius, 0, Math.PI * 2);
		ctx.fill();
	}
}
