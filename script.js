// Game Canvas Setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const statusElement = document.getElementById('status');

// Player (The Pink Cube)
const player = {
    x: 50,
    y: canvas.height - 100,
    width: 40,
    height: 40,
    velocityX: 0,
    velocityY: 0,
    speed: 5,
    jumpPower: 15,
    isGrounded: false,
    color: '#ff6b8b', // Pink color
    facingRight: true
};

// Game World & Platforms
const gravity = 0.8;
const friction = 0.8;
const platforms = [
    // Ground platforms
    { x: 0, y: canvas.height - 60, width: 1200, height: 60, color: '#4ecca3' },
    // Floating platforms
    { x: 300, y: canvas.height - 150, width: 200, height: 20, color: '#4ecca3' },
    { x: 600, y: canvas.height - 200, width: 200, height: 20, color: '#4ecca3' },
    { x: 900, y: canvas.height - 250, width: 200, height: 20, color: '#4ecca3' },
    { x: 1200, y: canvas.height - 150, width: 200, height: 20, color: '#4ecca3' },
    { x: 1500, y: canvas.height - 100, width: 200, height: 20, color: '#4ecca3' }
];

// Collectible coins
const coins = [
    { x: 350, y: canvas.height - 190, width: 15, height: 15, collected: false },
    { x: 650, y: canvas.height - 240, width: 15, height: 15, collected: false },
    { x: 950, y: canvas.height - 290, width: 15, height: 15, collected: false },
    { x: 1250, y: canvas.height - 190, width: 15, height: 15, collected: false },
    { x: 1550, y: canvas.height - 140, width: 15, height: 15, collected: false }
];

// Game state
let cameraOffset = 0;
let score = 0;
let gameOver = false;
let gameWon = false;

// Key Press State
const keys = {};

// Event Listeners for Keyboard
window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    // Prevent arrow key scrolling
    if(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Game Loop Functions
function update() {
    if (gameOver || gameWon) return;
    
    // Apply Gravity
    player.velocityY += gravity;

    // Apply friction to horizontal movement
    player.velocityX *= friction;

    // Handle Horizontal Movement (Arrow Keys and WASD)
    if (keys['ArrowRight'] || keys['d']) {
        player.velocityX = player.speed;
        player.facingRight = true;
    }
    if (keys['ArrowLeft'] || keys['a']) {
        player.velocityX = -player.speed;
        player.facingRight = false;
    }

    // Handle Jumping (Spacebar, Arrow Up, or 'w')
    if ((keys[' '] || keys['ArrowUp'] || keys['w']) && player.isGrounded) {
        player.velocityY = -player.jumpPower;
        player.isGrounded = false;
    }

    // Update Player Position
    player.x += player.velocityX;
    player.y += player.velocityY;

    // Camera follows the player
    cameraOffset = player.x - canvas.width / 3;

    // Keep player within the game world on the left
    if (player.x < 0) {
        player.x = 0;
    }

    // Check if player fell off the world
    if (player.y > canvas.height) {
        gameOver = true;
        statusElement.textContent = "GAME OVER - Press R to restart";
    }

    // Platform Collision Detection
    player.isGrounded = false;
    for (let platform of platforms) {
        if (player.x < platform.x + platform.width &&
            player.x + player.width > platform.x &&
            player.y + player.height > platform.y &&
            player.y + player.height < platform.y + platform.height &&
            player.velocityY > 0) {
            player.isGrounded = true;
            player.velocityY = 0;
            player.y = platform.y - player.height;
        }
    }

    // Coin collection detection
    for (let coin of coins) {
        if (!coin.collected &&
            player.x < coin.x + coin.width &&
            player.x + player.width > coin.x &&
            player.y < coin.y + coin.height &&
            player.y + player.height > coin.y) {
            coin.collected = true;
            score += 100;
            scoreElement.textContent = `Score: ${score}`;
        }
    }

    // Check if player reached the end
    if (player.x > 1700) {
        gameWon = true;
        statusElement.textContent = "YOU WIN! - Press R to restart";
    }
}

function draw() {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Save the context before applying camera transform
    ctx.save();
    ctx.translate(-cameraOffset, 0);

    // Draw background
    drawBackground();

    // Draw all platforms
    for (let platform of platforms) {
        ctx.fillStyle = platform.color;
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        
        // Add platform details for 8-bit look
        ctx.fillStyle = '#3aa88a';
        ctx.fillRect(platform.x, platform.y, platform.width, 5);
    }

    // Draw coins
    for (let coin of coins) {
        if (!coin.collected) {
            ctx.fillStyle = '#ffd700';
            ctx.beginPath();
            ctx.arc(coin.x + coin.width/2, coin.y + coin.height/2, coin.width/2, 0, Math.PI * 2);
            ctx.fill();
            
            // Add shine to coins
            ctx.fillStyle = '#fff9c4';
            ctx.beginPath();
            ctx.arc(coin.x + coin.width/3, coin.y + coin.height/3, coin.width/6, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Draw the player (pink cube)
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // Add details to the cube for 8-bit look
    ctx.fillStyle = '#ff8fab';
    ctx.fillRect(player.x + 5, player.y + 5, player.width - 10, player.height - 10);
    
    // Draw eyes on the cube
    ctx.fillStyle = '#000';
    if (player.facingRight) {
        ctx.fillRect(player.x + 25, player.y + 15, 5, 5);
    } else {
        ctx.fillRect(player.x + 10, player.y + 15, 5, 5);
    }

    // Restore the context
    ctx.restore();
    
    // Draw UI elements that don't move with the camera
    if (gameOver) {
        drawGameOver();
    } else if (gameWon) {
        drawWinScreen();
    }
}

function drawBackground() {
    // Draw sky gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#16213e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width * 3, canvas.height);

    // Draw distant mountains
    ctx.fillStyle = '#0f3460';
    for (let i = 0; i < 10; i++) {
        const x = (i * 300) % (canvas.width * 3);
        const height = 80 + Math.sin(i) * 20;
        ctx.beginPath();
        ctx.moveTo(x, canvas.height - 60);
        ctx.lineTo(x + 150, canvas.height - 60 - height);
        ctx.lineTo(x + 300, canvas.height - 60);
        ctx.fill();
    }

    // Draw simple 8-bit style stars
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 50; i++) {
        const x = (i * 70) % (canvas.width * 3);
        const y = (i * 30) % (canvas.height - 100);
        ctx.fillRect(x, y, 2, 2);
    }
}

function drawGameOver() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#ff6b8b';
    ctx.font = '24px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 20);
    
    ctx.fillStyle = '#e6e6e6';
    ctx.font = '14px "Press Start 2P"';
    ctx.fillText('Press R to restart', canvas.width / 2, canvas.height / 2 + 20);
}

function drawWinScreen() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#4ecca3';
    ctx.font = '24px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.fillText('YOU WIN!', canvas.width / 2, canvas.height / 2 - 20);
    
    ctx.fillStyle = '#e6e6e6';
    ctx.font = '14px "Press Start 2P"';
    ctx.fillText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2 + 10);
    ctx.fillText('Press R to restart', canvas.width / 2, canvas.height / 2 + 40);
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Restart game function
function restartGame() {
    // Reset player
    player.x = 50;
    player.y = canvas.height - 100;
    player.velocityX = 0;
    player.velocityY = 0;
    player.isGrounded = false;
    
    // Reset coins
    for (let coin of coins) {
        coin.collected = false;
    }
    
    // Reset game state
    score = 0;
    scoreElement.textContent = `Score: ${score}`;
    gameOver = false;
    gameWon = false;
    statusElement.textContent = "";
    cameraOffset = 0;
}

// Listen for restart key
window.addEventListener('keydown', (e) => {
    if (e.key === 'r' || e.key === 'R') {
        restartGame();
    }
});

// Start the game
gameLoop();
