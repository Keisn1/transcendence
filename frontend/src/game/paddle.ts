export interface Paddles {
    left: Paddle;
    right: Paddle;
}

export interface PaddleConfig {
    speed: number;
    color: string;
}

export class Paddle {
    public width: number;
    public height: number;
    public speed: number;
    public posX: number;
    public posY: number;
    public color: string;
    public side: string;
    private justCollided: boolean = false;

    constructor(side: string, config: PaddleConfig, canvas: HTMLCanvasElement) {
        this.side = side;
        this.speed = config.speed;
        this.color = config.color;

        this.width = Math.round(canvas.width / 125);
        this.height = Math.round(canvas.height / 7);

        this.posY = Math.round((canvas.height - this.height) / 2);

        if (this.side === "left") {
            this.posX = Math.round(canvas.width / 60);
        } else {
            this.posX = canvas.width - Math.round(canvas.width / 60) - this.width;
        }
    }

    moveUp(canvas: HTMLCanvasElement) {
        this.posY = Math.max(0, Math.min(canvas.height - this.height, this.posY - this.speed));
    }

    moveDown(canvas: HTMLCanvasElement) {
        this.posY = Math.max(0, Math.min(canvas.height - this.height, this.posY + this.speed));
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = "#fff";
        ctx.fillRect(this.posX, this.posY, this.width, this.height);
    }

    public collidesWithCircle(ballX: number, ballY: number, radius: number): boolean {
        const left = this.posX;
        const right = this.posX + this.width;
        const top = this.posY;
        const bottom = this.posY + this.height;

        // closest point on paddle to circle center
        const closestX = Math.max(left, Math.min(ballX, right)); // 
        const closestY = Math.max(top, Math.min(ballY, bottom));

        // distance from ball center to closes point on paddle
        const dx = ballX - closestX;
        const dy = ballY - closestY;

        // pythagoras
        const collides = dx * dx + dy * dy <= radius * radius;


        /*
         * not colliding -> colliding: return true once and set justCollided = true.
         * colliding -> colliding: keep returning false
         * colliding -> not colliding: reset justCollided = false so a future entry can report true again.
         */
        if (collides && !this.justCollided) {
            this.justCollided = true;
            return true;
        }

        this.justCollided = !collides ? false : this.justCollided;
        return false;
    }
}
