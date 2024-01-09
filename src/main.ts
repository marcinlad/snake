const canvas = document.getElementById('snakeCanvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
const boxSize = 10;

const snake = getSnakeStartingPosition();
const direction = {
  current: 'right',
  next: 'right'
}
let food = getFoodPosition();
let score = 0;

let bestScore = parseInt(localStorage.getItem('best-score') || '0');
document.getElementById('best-score').innerHTML = bestScore.toString();

const difficultySelect = document.getElementById('difficulty') as HTMLSelectElement;

let intervalLength = parseInt(difficultySelect.value);
let stepInterval = null;

document.getElementById('start').addEventListener('click', () => startGame());

document.addEventListener('keydown', event => changeDirection(event.key));

document.getElementById('restart').addEventListener('click', () => restartGame())

difficultySelect.addEventListener('change', event => {
  intervalLength = parseInt((event.target as HTMLSelectElement).value);
})

function getSnakeStartingPosition () {
  const headPostion = {
    x: Math.floor(Math.random() * canvas.width / boxSize * 0.8),
    y: Math.floor(Math.random() * canvas.height / boxSize)
  }

  if (headPostion.x < 2) {
    headPostion.x = 2;
  }

  return [headPostion, { x: headPostion.x - 1, y: headPostion.y }, { x: headPostion.x - 2, y: headPostion.y }];
}

function getFoodPosition () {
  const position = {
    x: Math.floor(Math.random() * canvas.width / boxSize),
    y: Math.floor(Math.random() * canvas.height / boxSize)
  }

  if (snake.some(({x, y}) => x === position.x && y === position.y)) {
    return getFoodPosition();
  }

  return position;
}

function updateScore () {
  score += 1;
  document.getElementById('score').textContent = score.toString();
  if (score > bestScore) {
    bestScore = score;
    document.getElementById('best-score').textContent = score.toString();
  }
}

function drawCanvas () {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#000000";
  snake.forEach(segment => {
    ctx.fillRect(segment.x * boxSize, segment.y * boxSize, boxSize, boxSize);
  });

  ctx.fillStyle = "#008000";
  ctx.fillRect(food.x * boxSize, food.y * boxSize, boxSize, boxSize);
}

function makeMove () {
  const head = { ...snake[0] };

  switch (direction.next) {
    case 'up':
      head.y -= 1;
      break;
    case 'down':
      head.y += 1;
      break;
    case 'left':
      head.x -= 1;
      break;
    case 'right':
      head.x += 1;
      break;
  }

  snake.unshift(head);

  direction.current = direction.next;

  if (head.x === food.x && head.y === food.y) {
    updateScore();
    food = getFoodPosition();
  } else {
    snake.pop();
  }
}

function isCollision () {
  const head = { ...snake[0] };

  if (head.x < 0 || head.y < 0 || head.x * boxSize >= canvas.width || head.y * boxSize >= canvas.height) {
    return true;
  }

  return snake.some(({ x, y }, index) => index !== 0 && head.x === x && head.y === y);
}

function gameOver () {
  clearInterval(stepInterval);

  document.getElementById('game-over').classList.remove('hidden');
  document.getElementById('restart').classList.remove('hidden');
  document.getElementById('controls').classList.remove('hidden');

  localStorage.setItem('best-score', bestScore.toString());
}

function startGame () {
  document.getElementById('start').classList.add('hidden');
  document.getElementById('controls').classList.add('hidden');
  stepInterval = setInterval(gameStep, intervalLength)
}

function restartGame () {
  score = 0;

  document.getElementById('score').textContent = score.toString();
  document.getElementById('controls').classList.add('hidden');

  snake.length = 0;
  snake.push(...getSnakeStartingPosition());

  direction.current = 'right';
  direction.next = 'right';

  food = getFoodPosition();

  stepInterval = setInterval(gameStep, intervalLength)
}

function changeDirection (key: string) {
  switch (key) {
    case "ArrowUp":
      if (direction.current !== "down") direction.next = "up";
      break;
    case "ArrowDown":
      if (direction.current !== 'up') direction.next = "down";
      break;
    case "ArrowLeft":
      if (direction.current !== 'right') direction.next = "left";
      break;
    case "ArrowRight":
      if (direction.current !== 'left') direction.next = "right";
      break;
  }
}

function gameStep () {
  drawCanvas();
  makeMove();
  if (isCollision()) {
    gameOver();
  }
}
