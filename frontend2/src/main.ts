import "./style.css";
import gameTemplate from "./templates/game.html?raw";

class PongGame {
  private canvas!: HTMLCanvasElement; // the ! is to suppress NULL
  private ctx!: CanvasRenderingContext2D;
  private gameRunning = false;

  constructor() {
    this.setupCanvas();
    this.setupControls();
  }

  private setupCanvas() {
    // Replace the existing content
    document.getElementById("app")!.innerHTML = gameTemplate;
    this.canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
    this.canvas.width = 800;
    this.canvas.height = 400;
    this.ctx = this.canvas.getContext("2d")!;
  }

  private setupControls() {
    const startBtn = document.getElementById("start-btn")!;
    startBtn.addEventListener("click", () => this.startGame());
  }

  private startGame() {
    this.gameRunning = true;
    this.gameLoop();
  }

  private gameLoop() {
    if (!this.gameRunning) return;

    this.update();
    this.render();
    requestAnimationFrame(() => this.gameLoop());
  }

  private update() {
    // Game logic will go here
  }

  private render() {
    // Clear canvas
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw center line
    this.ctx.strokeStyle = "white";
    this.ctx.setLineDash([5, 15]);
    this.ctx.beginPath();
    this.ctx.moveTo(this.canvas.width / 2, 0);
    this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
    this.ctx.stroke();
  }
}

// Initialize game when DOM loads
new PongGame();
