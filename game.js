const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const BOX = 20;
const COLS = canvas.width / BOX;
const ROWS = canvas.height / BOX;

// GAME STATE
let snake, food, dir, score, speed, lastTime;
let paused = false;

// SCORES
let highScore = localStorage.getItem("snakeHighScore") || 0;

// SOUNDS
const eatSound = new Audio("https://assets.mixkit.co/sfx/preview/mixkit-arcade-bonus-alert-767.mp3");
const gameOverSound = new Audio("https://assets.mixkit.co/sfx/preview/mixkit-player-losing-or-failing-2042.mp3");

// INIT GAME
function initGame() {
  snake = [{ x: 10, y: 10 }];
  dir = null;
  score = 0;
  speed = 7;
  food = randomFood();
  lastTime = 0;
}
initGame();

// RANDOM FOOD
function randomFood() {
  return {
    x: Math.floor(Math.random() * COLS),
    y: Math.floor(Math.random() * ROWS)
  };
}

// CONTROLS
document.addEventListener("keydown", e => {
  if (e.key === "ArrowUp" && dir !== "DOWN") dir = "UP";
  if (e.key === "ArrowDown" && dir !== "UP") dir = "DOWN";
  if (e.key === "ArrowLeft" && dir !== "RIGHT") dir = "LEFT";
  if (e.key === "ArrowRight" && dir !== "LEFT") dir = "RIGHT";
});

// TOUCH CONTROLS
let sx, sy;
canvas.addEventListener("touchstart", e => {
  const t = e.touches[0];
  sx = t.clientX;
  sy = t.clientY;
});
canvas.addEventListener("touchend", e => {
  const t = e.changedTouches[0];
  const dx = t.clientX - sx;
  const dy = t.clientY - sy;
  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 30 && dir !== "LEFT") dir = "RIGHT";
    if (dx < -30 && dir !== "RIGHT") dir = "LEFT";
  } else {
    if (dy > 30 && dir !== "UP") dir = "DOWN";
    if (dy < -30 && dir !== "DOWN") dir = "UP";
  }
});

// DRAW
function draw() {
  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // SNAKE (RAINBOW)
  snake.forEach((s, i) => {
    ctx.fillStyle = `hsl(${i * 30},100%,50%)`;
    ctx.fillRect(s.x * BOX, s.y * BOX, BOX - 1, BOX - 1);
  });

  // FOOD
  ctx.fillStyle = "red";
  ctx.fillRect(food.x * BOX, food.y * BOX, BOX, BOX);

  // SCORE
  ctx.fillStyle = "#fff";
  ctx.font = "16px Arial";
  ctx.fillText("Score: " + score, 10, 20);
  ctx.fillText("High: " + highScore, 10, 40);
}

// UPDATE
function update() {
  if (!dir) return;

  const head = { ...snake[0] };

  if (dir === "UP") head.y--;
  if (dir === "DOWN") head.y++;
  if (dir === "LEFT") head.x--;
  if (dir === "RIGHT") head.x++;

  // GAME OVER
  if (
    head.x < 0 || head.y < 0 ||
    head.x >= COLS || head.y >= ROWS ||
    snake.some(p => p.x === head.x && p.y === head.y)
  ) {
    gameOverSound.play();
    alert("Game Over! Score: " + score);
    if (score > highScore) {
      highScore = score;
      localStorage.setItem("snakeHighScore", highScore);
    }
    initGame();
    return;
  }

  snake.unshift(head);

  // EAT FOOD
  if (head.x === food.x && head.y === food.y) {
    eatSound.play();
    score++;
    if (score % 5 === 0) speed++;
    food = randomFood();
    if (navigator.vibrate) navigator.vibrate(80);
  } else {
    snake.pop();
  }
}

// GAME LOOP
function loop(time) {
  if (!paused && time - lastTime > 1000 / speed) {
    update();
    draw();
    lastTime = time;
  }
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

// BUTTONS
document.getElementById("pauseBtn").onclick = () => {
  paused = !paused;
  pauseBtn.textContent = paused ? "▶ Resume" : "⏸ Pause";
};

document.getElementById("restartBtn").onclick = () => {
  initGame();
};