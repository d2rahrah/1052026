console.log("JS loaded!");
console.log("startScene =", document.getElementById("startScene"));
console.log("messageScene =", document.getElementById("messageScene"));
console.log("gameScene =", document.getElementById("gameScene"));
console.log("lifeCanvas =", document.getElementById("lifeCanvas"));
console.log("playPauseBtn =", document.getElementById("playPauseBtn"));

window.onload = () => {
    const startScene = document.getElementById("startScene");
    const startBtn = document.getElementById("startBtn");
    const messageScene = document.getElementById("messageScene");
    const gameBtn = document.getElementById("gameBtn");
    const gameScene = document.getElementById("gameScene");

    //Music
    let bgMusic = new Audio("assets/music/background.wav");
    bgMusic.loop = true;
    bgMusic.volume = 0.6;

    // Start → Message
    startBtn.addEventListener("click", () => {
        console.log("Start clicked");
        startScene.classList.add("hidden");
        messageScene.classList.remove("hidden");
        bgMusic.play();   // ← muisc
        spawnParticles(); // particles
    });

    // Message → Game
    gameBtn.addEventListener("click", () => {
        console.log("Game clicked");
        messageScene.classList.add("hidden");
        gameScene.classList.remove("hidden");
        initGameOfLife();
    });

    // Particles
    function spawnParticles() {
        const container = document.getElementById("particles");
        container.innerHTML = "";

        // Spark-line particles
        for (let i = 0; i < 20; i++) {   // adjust 20 → more or fewer sparks
            const s = document.createElement("div");
            s.classList.add("spark");

            s.style.left = Math.random() * 100 + "vw";
            s.style.animationDuration = 3 + Math.random() * 5 + "s";

            // random height variation
            const h = 15 + Math.random() * 35;
            s.style.height = h + "px";

            // slight random rotation
            s.style.transform = `rotate(${Math.random() * 20 - 10}deg)`;

            container.appendChild(s);
        }
    }

    // Game of Life
    let canvas, ctx;
    let grid, rows, cols;
    const cellSize = 20;
    let running = false;
    let intervalId = null;

    function initGameOfLife() {
        canvas = document.getElementById("lifeCanvas");
        ctx = canvas.getContext("2d");

        canvas.width = gameScene.clientWidth;
        canvas.height = gameScene.clientHeight * 0.70;

        cols = Math.floor(canvas.width / cellSize);
        rows = Math.floor(canvas.height / cellSize);

        grid = createGrid(rows, cols);

        drawGrid();
        setupControls();
        setupTouch();
    }

    function createGrid(r, c) {
        return Array.from({ length: r }, () =>
        Array.from({ length: c }, () => 0)
        );
    }

    function drawGrid() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                if (grid[y][x] === 1) {
                    ctx.fillStyle = "#0ff";
                    ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
                } else {
                    ctx.strokeStyle = "#222";
                    ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
                }
            }
        }
    }

    function nextGeneration() {
        const newGrid = createGrid(rows, cols);

        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const alive = grid[y][x];
                const n = countNeighbors(x, y);

                if (alive && (n === 2 || n === 3)) newGrid[y][x] = 1;
                else if (!alive && n === 3) newGrid[y][x] = 1;
            }
        }

        grid = newGrid;
        drawGrid();
    }

    function countNeighbors(x, y) {
        let n = 0;
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue;
                const nx = x + dx;
                const ny = y + dy;
                if (nx >= 0 && nx < cols && ny >= 0 && ny < rows) {
                    n += grid[ny][nx];
                }
            }
        }
        return n;
    }

    function setupControls() {
        const playPauseBtn = document.getElementById("playPauseBtn");
        const speedSlider = document.getElementById("speedSlider");

        playPauseBtn.addEventListener("click", () => {
            running = !running;
            playPauseBtn.textContent = running ? "⏸" : "▶";

            if (running) {
                intervalId = setInterval(nextGeneration, speedSlider.value);
            } else {
                clearInterval(intervalId);
            }
        });

        speedSlider.addEventListener("input", () => {
            if (running) {
                clearInterval(intervalId);
                intervalId = setInterval(nextGeneration, speedSlider.value);
            }
        });
    }

    function setupTouch() {
        canvas.addEventListener("pointerdown", (e) => {
            const rect = canvas.getBoundingClientRect();
            const x = Math.floor((e.clientX - rect.left) / cellSize);
            const y = Math.floor((e.clientY - rect.top) / cellSize);

            if (y >= 0 && y < rows && x >= 0 && x < cols) {
                grid[y][x] = grid[y][x] ? 0 : 1;
                drawGrid();
            }
        });
    }
};
