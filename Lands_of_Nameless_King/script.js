const LEVELS = {
    easy: {
        name: "Easy",
        rows: 5,
        cols: 5,
        houses: [
            { r: 0, c: 0, size: 1 },
            { r: 0, c: 2, size: 5 },
            { r: 2, c: 1, size: 1 },
            { r: 3, c: 3, size: 5 },
            { r: 4, c: 0, size: 1 }
        ]
    },
    medium: {
        name: "Medium",
        rows: 7,
        cols: 7,
        houses: [
            { r: 0, c: 0, size: 12 },
            { r: 0, c: 6, size: 4 },
            { r: 3, c: 0, size: 1 },
            { r: 3, c: 2, size: 1 },
            { r: 5, c: 0, size: 7 },
            { r: 5, c: 5, size: 3 }
        ]
    },
    hard: {
        name: "Hard",
        rows: 10,
        cols: 10,
        houses: [
            { r: 0, c: 0, size: 12 },
            { r: 0, c: 7, size: 7 },
            { r: 2, c: 4, size: 2 },
            { r: 4, c: 0, size: 5 },
            { r: 4, c: 4, size: 1 },
            { r: 4, c: 6, size: 2 },
            { r: 4, c: 9, size: 1 },
            { r: 6, c: 4, size: 1 },
            { r: 6, c: 6, size: 1 },
            { r: 6, c: 8, size: 1 },
            { r: 7, c: 0, size: 13 },
            { r: 7, c: 5, size: 1 },
            { r: 8, c: 7, size: 4 }
        ]
    }
};

const CELL_STATE = {
    EMPTY: 0,
    WALL: 1,
    PROPERTY: 2
};

function createEmptyGrid(rows, cols) {
    const grid = [];

    for (let r = 0; r < rows; r++) {
        const row = [];
        for (let c = 0; c < cols; c++) {
            row.push(CELL_STATE.EMPTY);
        }
        grid.push(row);
    }
    return grid;
}

function renderBoard(levelKey, playerGrid) {
    const level = LEVELS[levelKey];
    const boardElement = document.querySelector(".grid-board");

    boardElement.innerHTML = "";

    const baseCellSize = level.cols > 6 ? 40 : 54;
    boardElement.style.width = `min(92vw, ${level.cols * baseCellSize}px)`;
    boardElement.style.height = "auto";

    boardElement.style.gridTemplateColumns = `repeat(${level.cols}, 1fr)`;
    boardElement.style.gridTemplateRows = `repeat(${level.rows}, 1fr)`;

    for (let r = 0; r < level.rows; r += 1) {
        for (let c = 0; c < level.cols; c += 1) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.dataset.r = r;
            cell.dataset.c = c;

            const house = level.houses.find(h => h.r === r && h.c === c);

            if (house) {
                cell.classList.add("house");
                cell.textContent = house.size;
            } else {
                const state = playerGrid[r][c];
                if (state === CELL_STATE.WALL) {
                    cell.classList.add("wall");
                } else if (state === CELL_STATE.PROPERTY) {
                    cell.classList.add("property");
                }
            }

            boardElement.appendChild(cell);
        }
    }
    checkSolidWallBlocks(levelKey, playerGrid);
    checkPropertySizes(levelKey, playerGrid);

    if (!isGameOver && checkVictory(levelKey, playerGrid)) {
        isGameOver = true;
        stopTimer();
        saveToLeaderboard(playerName, levelKey, secondsElapsed);

        const victoryElement = document.querySelector(".victory-message");
        if (victoryElement) {
            victoryElement.textContent = "Victory, " + playerName + "! You solved " + LEVELS[levelKey].name + " in " + formatTime(secondsElapsed) + "!";
            victoryElement.style.display = "block";
        }
    }
}

let playerName = "";
let currentLevelKey = "easy";
let playerGrid = createEmptyGrid(LEVELS[currentLevelKey].rows, LEVELS[currentLevelKey].cols);
let isGameOver = false;

let secondsElapsed = 0;
let timerInterval = null;

function formatTime(totalSeconds) {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    const minString = mins < 10 ? "0" + mins : mins;
    const secString = secs < 10 ? "0" + secs : secs;
    return minString + ":" + secString;
}

function startTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    secondsElapsed = 0;
    const timerElement = document.querySelector(".timer");
    if (timerElement) {
        timerElement.textContent = "Time: " + formatTime(secondsElapsed);
    }

    timerInterval = setInterval(() => {
        secondsElapsed += 1;
        if (timerElement) {
            timerElement.textContent = "Time: " + formatTime(secondsElapsed);
        }
    }, 1000);
}

function resumeTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    const timerElement = document.querySelector(".timer");
    if (timerElement) {
        timerElement.textContent = "Time: " + formatTime(secondsElapsed);
    }

    timerInterval = setInterval(() => {
        secondsElapsed += 1;
        if (timerElement) {
            timerElement.textContent = "Time: " + formatTime(secondsElapsed);
        }
    }, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function saveToLeaderboard(name, levelKey, timeSpent) {
    const storageKey = "leaderboard_" + levelKey;
    const existingData = localStorage.getItem(storageKey);
    let records = [];

    if (existingData) {
        records = JSON.parse(existingData);
    }

    records.push({
        name: name,
        time: timeSpent
    });

    records.sort((a, b) => a.time - b.time);
    localStorage.setItem(storageKey, JSON.stringify(records));
    renderAllLeaderboards();
}

function renderAllLeaderboards() {
    const levels = ["easy", "medium", "hard"];

    levels.forEach(levelKey => {
        const listElement = document.querySelector("#leaderboard-" + levelKey);
        if (!listElement) return;

        const storageKey = "leaderboard_" + levelKey;
        const existingData = localStorage.getItem(storageKey);
        let records = [];

        if (existingData) {
            records = JSON.parse(existingData);
        }

        records.sort((a, b) => a.time - b.time);
        listElement.innerHTML = "";

        if (records.length === 0) {
            const emptyItem = document.createElement("li");
            emptyItem.textContent = "No games completed yet";
            emptyItem.style.color = "#888";
            listElement.appendChild(emptyItem);
            return;
        }

        records.forEach(rec => {
            const item = document.createElement("li");
            item.textContent = rec.name + " — " + formatTime(rec.time);
            listElement.appendChild(item);
        });
    });
}

function getSavedGames() {
    let list = [];
    const saved = localStorage.getItem("savedGames");
    if (saved) {
        try {
            list = JSON.parse(saved);
        } catch (e) {
            list = [];
        }
    }

    // Support migrating old single save if present
    const legacy = localStorage.getItem("savedGame");
    if (legacy) {
        try {
            const old = JSON.parse(legacy);
            if (old && old.playerName) {
                list.push(old);
                localStorage.setItem("savedGames", JSON.stringify(list));
            }
        } catch (e) {}
        localStorage.removeItem("savedGame");
    }

    return Array.isArray(list) ? list : [];
}

function renderSavedGames() {
    const listElement = document.querySelector(".saved-games-list");
    if (!listElement) return;

    const savedGames = getSavedGames();
    listElement.innerHTML = "";

    if (savedGames.length === 0) {
        listElement.innerHTML = '<p style="color: #888; font-style: italic; margin: 4px 0;">No saved games</p>';
        return;
    }

    savedGames.forEach((game, index) => {
        const item = document.createElement("div");
        item.className = "saved-game-item";

        const levelName = LEVELS[game.levelKey] ? LEVELS[game.levelKey].name : game.levelKey;

        item.innerHTML = `
            <span><strong>${game.playerName}</strong> (${levelName}) - ${formatTime(game.secondsElapsed)}</span>
            <div>
                <button class="load-btn" data-index="${index}">Load</button>
                <button class="delete-btn" data-index="${index}">Delete</button>
            </div>
        `;
        listElement.appendChild(item);
    });
}

const startScreen = document.querySelector(".start-screen");
const gameScreen = document.querySelector(".game-screen");
const startBtn = document.querySelector(".start-game-btn");
const nameInput = document.querySelector(".player-name-input");
const backBtn = document.querySelector(".back-to-menu-btn");
const levelSelect = document.querySelector(".level-select");
const rulesBtn = document.querySelector(".rules-btn");
const closeRulesBtn = document.querySelector(".close-rules-btn");
const rulesModal = document.querySelector(".rules-modal");
const saveGameBtn = document.querySelector(".save-game-btn");
const saveFeedback = document.querySelector(".save-feedback");
const savedGamesList = document.querySelector(".saved-games-list");

if (rulesBtn && rulesModal) {
    rulesBtn.addEventListener("click", () => {
        rulesModal.style.display = "block";
    });
}

if (closeRulesBtn && rulesModal) {
    closeRulesBtn.addEventListener("click", () => {
        rulesModal.style.display = "none";
    });
}

if (saveGameBtn) {
    saveGameBtn.addEventListener("click", () => {
        if (isGameOver) return;

        const savedGames = getSavedGames();
        savedGames.push({
            playerName: playerName,
            levelKey: currentLevelKey,
            playerGrid: JSON.parse(JSON.stringify(playerGrid)),
            secondsElapsed: secondsElapsed
        });
        localStorage.setItem("savedGames", JSON.stringify(savedGames));

        if (saveFeedback) {
            saveFeedback.style.display = "inline";
            setTimeout(() => {
                saveFeedback.style.display = "none";
            }, 2000);
        }
    });
}

if (savedGamesList) {
    savedGamesList.addEventListener("click", (e) => {
        const loadBtn = e.target.closest(".load-btn");
        if (loadBtn) {
            const index = parseInt(loadBtn.dataset.index, 10);
            const savedGames = getSavedGames();
            const game = savedGames[index];
            if (!game) return;

            playerName = game.playerName;
            currentLevelKey = game.levelKey;
            playerGrid = JSON.parse(JSON.stringify(game.playerGrid));
            secondsElapsed = game.secondsElapsed;
            isGameOver = false;

            document.querySelector(".player-name").textContent = "Player: " + playerName + " (" + LEVELS[currentLevelKey].name + ")";

            startScreen.style.display = "none";
            gameScreen.style.display = "block";

            const victoryElement = document.querySelector(".victory-message");
            if (victoryElement) {
                victoryElement.style.display = "none";
            }

            resumeTimer();
            renderBoard(currentLevelKey, playerGrid);
            return;
        }

        const deleteBtn = e.target.closest(".delete-btn");
        if (deleteBtn) {
            const index = parseInt(deleteBtn.dataset.index, 10);
            const savedGames = getSavedGames();
            savedGames.splice(index, 1);
            localStorage.setItem("savedGames", JSON.stringify(savedGames));
            renderSavedGames();
            return;
        }
    });
}

if (levelSelect) {
    levelSelect.addEventListener("change", () => {
        currentLevelKey = levelSelect.value;
    });
}

startBtn.addEventListener("click", () => {
    const enteredName = nameInput.value.trim();
    if (!enteredName) {
        nameInput.focus();
        return;
    }

    if (levelSelect) {
        currentLevelKey = levelSelect.value;
    }

    playerName = enteredName;
    document.querySelector(".player-name").textContent = "Player: " + playerName + " (" + LEVELS[currentLevelKey].name + ")";

    startScreen.style.display = "none";
    gameScreen.style.display = "block";

    isGameOver = false;
    const victoryElement = document.querySelector(".victory-message");
    if (victoryElement) {
        victoryElement.style.display = "none";
    }

    playerGrid = createEmptyGrid(LEVELS[currentLevelKey].rows, LEVELS[currentLevelKey].cols);
    startTimer();
    renderBoard(currentLevelKey, playerGrid);
});

backBtn.addEventListener("click", () => {
    stopTimer();
    gameScreen.style.display = "none";
    startScreen.style.display = "block";
    renderAllLeaderboards();
    renderSavedGames();
});

renderAllLeaderboards();
renderSavedGames();

function isHouse(r, c, levelKey) {
    const level = LEVELS[levelKey];
    return level.houses.some(h => h.r === r && h.c === c);
}

const boardElement = document.querySelector(".grid-board");

let isDragging = false;
let dragMode = null;

boardElement.addEventListener("mousedown", (e) => {
    if (isGameOver) {
        return;
    }

    if (e.button !== 0) {
        return;
    }

    const cell = e.target.closest(".cell");
    if (!cell) {
        return;
    }

    const r = parseInt(cell.dataset.r, 10);
    const c = parseInt(cell.dataset.c, 10);

    if (isHouse(r, c, currentLevelKey)) {
        return;
    }

    isDragging = true;


    if (playerGrid[r][c] === CELL_STATE.WALL) {
        dragMode = CELL_STATE.EMPTY;
    } else {
        dragMode = CELL_STATE.WALL;
    }


    playerGrid[r][c] = dragMode;
    renderBoard(currentLevelKey, playerGrid);
});

boardElement.addEventListener("mouseover", (e) => {
    if (!isDragging) {
        return;
    }

    const cell = e.target.closest(".cell");
    if (!cell) {
        return;
    }

    const r = parseInt(cell.dataset.r, 10);
    const c = parseInt(cell.dataset.c, 10);

    if (isHouse(r, c, currentLevelKey)) {
        return;
    }

    if (playerGrid[r][c] !== dragMode) {
        playerGrid[r][c] = dragMode;
        renderBoard(currentLevelKey, playerGrid);
    }
});

window.addEventListener("mouseup", () => {
    isDragging = false;
});

boardElement.addEventListener("contextmenu", (e) => {
    e.preventDefault();

    if (isGameOver) {
        return;
    }

    const cell = e.target.closest(".cell");
    if (!cell) return;

    const r = parseInt(cell.dataset.r, 10);
    const c = parseInt(cell.dataset.c, 10);

    if (isHouse(r, c, currentLevelKey)) return;

    if (playerGrid[r][c] === CELL_STATE.PROPERTY) {
        playerGrid[r][c] = CELL_STATE.EMPTY;
    } else {
        playerGrid[r][c] = CELL_STATE.PROPERTY;
    }

    renderBoard(currentLevelKey, playerGrid);
});

function markCellAsError(r, c) {
    const cell = document.querySelector(`.cell[data-r="${r}"][data-c="${c}"]`);
    if (cell) {
        cell.classList.add("error");
    }
}

function checkSolidWallBlocks(levelKey, playerGrid) {
    const level = LEVELS[levelKey];
    const rows = level.rows;
    const cols = level.cols;

    for (let r = 0; r < rows - 1; r += 1) {
        for (let c = 0; c < cols - 1; c += 1) {
            const is2x2Wall =
                playerGrid[r][c] === CELL_STATE.WALL &&
                playerGrid[r][c + 1] === CELL_STATE.WALL &&
                playerGrid[r + 1][c] === CELL_STATE.WALL &&
                playerGrid[r + 1][c + 1] === CELL_STATE.WALL;

            if (is2x2Wall) {
                markCellAsError(r, c);
                markCellAsError(r, c + 1);
                markCellAsError(r + 1, c);
                markCellAsError(r + 1, c + 1);
            }
        }
    }
}

function checkPropertySizes(levelKey, playerGrid) {
    const level = LEVELS[levelKey];
    const rows = level.rows;
    const cols = level.cols;

    const directions = [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1]
    ];

    level.houses.forEach(house => {
        const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
        const component = [];
        const queue = [{ r: house.r, c: house.c }];
        visited[house.r][house.c] = true;

        let canStillExpand = false;

        while (queue.length > 0) {
            const cur = queue.shift();
            component.push(cur);

            for (const [dr, dc] of directions) {
                const nr = cur.r + dr;
                const nc = cur.c + dc;

                if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) {
                    continue;
                }

                if (playerGrid[nr][nc] === CELL_STATE.EMPTY && !isHouse(nr, nc, levelKey)) {
                    canStillExpand = true;
                }

                const isMarkedProperty = playerGrid[nr][nc] === CELL_STATE.PROPERTY;
                const isNeighborHouse = isHouse(nr, nc, levelKey);

                if ((isMarkedProperty || isNeighborHouse) && !visited[nr][nc]) {
                    visited[nr][nc] = true;
                    queue.push({ r: nr, c: nc });
                }
            }
        }

        if (component.length > house.size) {
            component.forEach(pt => markCellAsError(pt.r, pt.c));
        }

        if (!canStillExpand && component.length < house.size) {
            component.forEach(pt => markCellAsError(pt.r, pt.c));
        }
    });
}

function checkVictory(levelKey, playerGrid) {
    const level = LEVELS[levelKey];
    const rows = level.rows;
    const cols = level.cols;

    const directions = [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1]
    ];

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (!isHouse(r, c, levelKey) && playerGrid[r][c] === CELL_STATE.EMPTY) {
                return false;
            }
        }
    }

    for (let r = 0; r < rows - 1; r++) {
        for (let c = 0; c < cols - 1; c++) {
            const is2x2 =
                playerGrid[r][c] === CELL_STATE.WALL &&
                playerGrid[r][c + 1] === CELL_STATE.WALL &&
                playerGrid[r + 1][c] === CELL_STATE.WALL &&
                playerGrid[r + 1][c + 1] === CELL_STATE.WALL;

            if (is2x2) {
                return false;
            }
        }
    }

    let totalPropertyCells = 0;

    for (let i = 0; i < level.houses.length; i++) {
        const house = level.houses[i];
        const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
        const queue = [{ r: house.r, c: house.c }];
        visited[house.r][house.c] = true;

        let propertyCount = 0;
        let houseCount = 0;

        while (queue.length > 0) {
            const cur = queue.shift();
            propertyCount++;

            if (isHouse(cur.r, cur.c, levelKey)) {
                houseCount++;
            }

            for (const [dr, dc] of directions) {
                const nr = cur.r + dr;
                const nc = cur.c + dc;

                if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
                    const isProperty = playerGrid[nr][nc] === CELL_STATE.PROPERTY;
                    const isNeighborHouse = isHouse(nr, nc, levelKey);

                    if ((isProperty || isNeighborHouse) && !visited[nr][nc]) {
                        visited[nr][nc] = true;
                        queue.push({ r: nr, c: nc });
                    }
                }
            }
        }

        if (houseCount !== 1 || propertyCount !== house.size) {
            return false;
        }

        totalPropertyCells += propertyCount;
    }

    let boardPropertyCount = level.houses.length;
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (playerGrid[r][c] === CELL_STATE.PROPERTY) {
                boardPropertyCount++;
            }
        }
    }

    if (boardPropertyCount !== totalPropertyCells) {
        return false;
    }

    let totalWalls = 0;
    let firstWall = null;

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (playerGrid[r][c] === CELL_STATE.WALL) {
                totalWalls++;
                if (!firstWall) {
                    firstWall = { r: r, c: c };
                }
            }
        }
    }

    if (totalWalls > 0) {
        const wallVisited = Array.from({ length: rows }, () => Array(cols).fill(false));
        const wallQueue = [firstWall];
        wallVisited[firstWall.r][firstWall.c] = true;
        let connectedWalls = 0;

        while (wallQueue.length > 0) {
            const cur = wallQueue.shift();
            connectedWalls++;

            for (const [dr, dc] of directions) {
                const nr = cur.r + dr;
                const nc = cur.c + dc;

                if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
                    if (playerGrid[nr][nc] === CELL_STATE.WALL && !wallVisited[nr][nc]) {
                        wallVisited[nr][nc] = true;
                        wallQueue.push({ r: nr, c: nc });
                    }
                }
            }
        }

        if (connectedWalls !== totalWalls) {
            return false;
        }
    }

    return true;
}