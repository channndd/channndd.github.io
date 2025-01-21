
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('start-button');
const controls = document.getElementById('controls');
const pauseButton = document.getElementById('pause-button');
const fullscreenButton = document.getElementById('fullscreen-button');
const shrinkSpeedSlider = document.getElementById('shrink-speed');
const shrinkSpeedValue = document.getElementById('shrink-speed-value');
const targetSizeSlider = document.getElementById('target-size');
const targetSizeValue = document.getElementById('target-size-value');
const backgroundColorPicker = document.getElementById('background-color');

let score = 0;
let targetX = 0, targetY = 0;
let targetRadius = 45;
let targetColor = 'random';
let gameTime = Infinity;
let startTime = 0;
let timeRemaining = Infinity;
let shrinking = true;
let shrinkFactor = 0.5;
let newTargetInterval = 1000;
let lastTargetTime = 0;
let targetExists = false;
let gameRunning = false;
let gamePaused = false;
let targets = [];
let totalClicks = 0;
let successfulClicks = 0;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function setGameTime(seconds) {
    gameTime = seconds * 1000;
    timeRemaining = gameTime;
    updateTimeDisplay();
}

function setTargetColor(color) {
    targetColor = color === 'random' ? getRandomColor() : color;
}

function toggleShrink() {
    shrinking = !shrinking;
    document.getElementById('shrink-status').textContent = shrinking ? '开' : '关';
}

function getRandomColor() {
    const colors = ['red', 'green', 'blue', 'yellow', 'purple', 'orange'];
    return colors[Math.floor(Math.random() * colors.length)];
}

function drawTarget(target) {
    ctx.beginPath();
    ctx.arc(target.x, target.y, target.radius, 0, Math.PI * 2);
    ctx.fillStyle = target.color;
    ctx.fill();
    ctx.closePath();
}

function updateScore() {
    score++;
    document.getElementById('score').textContent = 'Score: ' + score;
}

function updateAccuracy() {
    const accuracy = totalClicks === 0 ? 0 : (successfulClicks / totalClicks) * 100;
    document.getElementById('accuracy').textContent = `Accuracy: ${accuracy.toFixed(2)}%`;
}

canvas.addEventListener('click', function(event) {
    if (!gameRunning || gamePaused) return;
    totalClicks++;
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    let hit = false;
    targets = targets.filter(target => {
        const dist = Math.sqrt((mouseX - target.x) ** 2 + (mouseY - target.y) ** 2);
        if (dist < target.radius) {
            updateScore();
            successfulClicks++;
            hit = true;
            return false; // 移除命中的目标
        }
        return true;
    });

    if (!hit) {
        // 鼠标误点击
    }
    updateAccuracy();
});

function createTarget() {
    return {
        x: Math.random() * (canvas.width - 50) + 25,
        y: Math.random() * (canvas.height - 50) + 25,
        radius: targetRadius,
        color: targetColor === 'random' ? getRandomColor() : targetColor
    };
}

function updateTimeDisplay() {
    const timeElement = document.getElementById('time-remaining');
    if (gameTime === Infinity) {
        const elapsedTime = (Date.now() - startTime) / 1000;
        timeElement.textContent = `Time: ${elapsedTime.toFixed(1)}s`;
    } else {
        const timeInSeconds = (timeRemaining / 1000).toFixed(1);
        timeElement.textContent = `Time Remaining: ${timeInSeconds}s`;
    }
}

function animate() {
    if (!gameRunning || gamePaused) return;

    const currentTime = Date.now();
    const elapsed = currentTime - startTime;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (gameTime !== Infinity) {
        timeRemaining = Math.max(gameTime - elapsed, 0);
        if (timeRemaining <= 0) {
            gameRunning = false;
            controls.classList.remove('hidden');
            pauseButton.classList.add('hidden');
            return;
        }
    }
    
    updateTimeDisplay();

    if (currentTime - lastTargetTime > newTargetInterval) {
        targets.push(createTarget());
        lastTargetTime = currentTime;
    }

    targets = targets.filter(target => {
        drawTarget(target);
        if (shrinking) {
            target.radius -= shrinkFactor;
        }
        return target.radius > 5;
    });

    requestAnimationFrame(animate);
}

function startGame() {
    score = 0;
    totalClicks = 0;
    successfulClicks = 0;
    document.getElementById('score').textContent = 'Score: 0';
    updateAccuracy();
    startTime = Date.now();
    gameRunning = true;
    gamePaused = false;
    targets = [];
    startButton.classList.add('hidden');
    controls.classList.add('hidden');
    pauseButton.classList.remove('hidden');
    fullscreenButton.classList.remove('hidden');
    pauseButton.textContent = '暂停';
    animate();
}

function restartGame() {
    startGame();
}

function togglePause() {
    if (gameRunning) {
        gamePaused = !gamePaused;
        if (gamePaused) {
            pauseButton.textContent = '继续';
            controls.classList.remove('hidden');
        } else {
            pauseButton.textContent = '暂停';
            controls.classList.add('hidden');
            animate();
        }
    }
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
        fullscreenButton.textContent = '退出全屏';
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
            fullscreenButton.textContent = '全屏';
        }
    }
}

startButton.addEventListener('click', startGame);
pauseButton.addEventListener('click', togglePause);
fullscreenButton.addEventListener('click', toggleFullscreen);

// 缩小速度调整
shrinkSpeedSlider.addEventListener('input', function() {
    shrinkFactor = parseFloat(this.value);
    shrinkSpeedValue.textContent = shrinkFactor.toFixed(1);
});

// 目标大小调整
targetSizeSlider.addEventListener('input', function() {
    targetRadius = parseInt(this.value);
    targetSizeValue.textContent = targetRadius;
});

// 背景颜色调整
backgroundColorPicker.addEventListener('input', function() {
    canvas.style.backgroundColor = this.value;
});
    
// 初始化设置
controls.classList.remove('hidden');
pauseButton.classList.add('hidden');
fullscreenButton.classList.add('hidden');
document.getElementById('shrink-status').textContent = '开';