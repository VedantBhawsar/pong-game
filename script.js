// Get canvas and context
const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

// Game objects
const paddleHeight = 80;
const paddleWidth = 10;
const ballRadius = 7;

// Player paddle (left)
const playerPaddle = {
    x: 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: 6
};

// Computer paddle (right)
const computerPaddle = {
    x: canvas.width - 20,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: 5
};

// Ball
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    dx: 5,
    dy: 5,
    radius: ballRadius,
    speed: 5
};

// Score
let playerScore = 0;
let computerScore = 0;

// Game state
let gameRunning = false;
let gamePaused = false;

// Input handling
const keys = {};

window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (e.key === ' ') {
        e.preventDefault();
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Mouse tracking
let mouseY = canvas.height / 2;
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseY = e.clientY - rect.top;
});

// Button controls
document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('pauseBtn').addEventListener('click', togglePause);
document.getElementById('resetBtn').addEventListener('click', resetGame);

function startGame() {
    if (!gameRunning) {
        gameRunning = true;
        gamePaused = false;
        document.getElementById('pauseBtn').textContent = 'Pause';
        document.getElementById('pauseBtn').classList.remove('paused');
        gameLoop();
    }
}

function togglePause() {
    if (gameRunning) {
        gamePaused = !gamePaused;
        const pauseBtn = document.getElementById('pauseBtn');
        if (gamePaused) {
            pauseBtn.textContent = 'Resume';
            pauseBtn.classList.add('paused');
        } else {
            pauseBtn.textContent = 'Pause';
            pauseBtn.classList.remove('paused');
            gameLoop();
        }
    }
}

function resetGame() {
    gameRunning = false;
    gamePaused = false;
    playerScore = 0;
    computerScore = 0;
    document.getElementById('playerScore').textContent = playerScore;
    document.getElementById('computerScore').textContent = computerScore;
    document.getElementById('pauseBtn').textContent = 'Pause';
    document.getElementById('pauseBtn').classList.remove('paused');
    resetBall();
    playerPaddle.y = canvas.height / 2 - paddleHeight / 2;
    computerPaddle.y = canvas.height / 2 - paddleHeight / 2;
    draw();
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * ball.speed;
    ball.dy = (Math.random() - 0.5) * ball.speed;
}

// Update game state
function update() {
    if (!gameRunning || gamePaused) return;

    // Player paddle movement - Mouse and Arrow keys
    if (mouseY - paddleHeight / 2 > 0 && mouseY - paddleHeight / 2 < canvas.height - paddleHeight) {
        playerPaddle.y = mouseY - paddleHeight / 2;
    }

    if (keys['ArrowUp'] && playerPaddle.y > 0) {
        playerPaddle.y -= playerPaddle.speed;
    }
    if (keys['ArrowDown'] && playerPaddle.y < canvas.height - paddleHeight) {
        playerPaddle.y += playerPaddle.speed;
    }

    // Ball movement
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Ball collision with top and bottom walls
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
        ball.dy = -ball.dy;
        ball.y = ball.y - ball.radius < 0 ? ball.radius : canvas.height - ball.radius;
    }

    // Ball collision with paddles
    if (
        ball.x - ball.radius < playerPaddle.x + playerPaddle.width &&
        ball.y > playerPaddle.y &&
        ball.y < playerPaddle.y + playerPaddle.height
    ) {
        ball.dx = -ball.dx;
        ball.x = playerPaddle.x + playerPaddle.width + ball.radius;
        // Add spin based on where ball hits paddle
        const hitPos = (ball.y - (playerPaddle.y + paddleHeight / 2)) / (paddleHeight / 2);
        ball.dy += hitPos * 3;
    }

    if (
        ball.x + ball.radius > computerPaddle.x &&
        ball.y > computerPaddle.y &&
        ball.y < computerPaddle.y + computerPaddle.height
    ) {
        ball.dx = -ball.dx;
        ball.x = computerPaddle.x - ball.radius;
        // Add spin based on where ball hits paddle
        const hitPos = (ball.y - (computerPaddle.y + paddleHeight / 2)) / (paddleHeight / 2);
        ball.dy += hitPos * 3;
    }

    // Ball out of bounds
    if (ball.x - ball.radius < 0) {
        computerScore++;
        document.getElementById('computerScore').textContent = computerScore;
        resetBall();
    }

    if (ball.x + ball.radius > canvas.width) {
        playerScore++;
        document.getElementById('playerScore').textContent = playerScore;
        resetBall();
    }

    // Computer paddle AI
    const computerCenter = computerPaddle.y + paddleHeight / 2;
    const ballDistance = ball.y - computerCenter;
    
    if (Math.abs(ballDistance) > 10) {
        if (ballDistance > 0 && computerPaddle.y < canvas.height - paddleHeight) {
            computerPaddle.y += computerPaddle.speed;
        } else if (ballDistance < 0 && computerPaddle.y > 0) {
            computerPaddle.y -= computerPaddle.speed;
        }
    }

    // Keep paddles in bounds
    playerPaddle.y = Math.max(0, Math.min(playerPaddle.y, canvas.height - paddleHeight));
    computerPaddle.y = Math.max(0, Math.min(computerPaddle.y, canvas.height - paddleHeight));
}

// Draw game
function draw() {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw center line
    ctx.strokeStyle = '#00ff88';
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw paddles
    ctx.fillStyle = '#00ff88';
    ctx.fillRect(playerPaddle.x, playerPaddle.y, playerPaddle.width, playerPaddle.height);
    ctx.fillRect(computerPaddle.x, computerPaddle.y, computerPaddle.width, computerPaddle.height);

    // Draw ball
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#00ff88';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Draw pause text
    if (gamePaused) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = 'bold 36px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2);
    }

    // Draw start text
    if (!gameRunning) {
        ctx.fillStyle = 'rgba(0, 255, 136, 0.7)';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Click "Start Game" to begin', canvas.width / 2, canvas.height / 2);
    }
}

// Main game loop
function gameLoop() {
    update();
    draw();

    if (gameRunning) {
        requestAnimationFrame(gameLoop);
    }
}

// Initial draw
draw();
