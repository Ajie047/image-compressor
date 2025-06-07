// 游戏状态
let gameBoard = [];
let mineLocations = [];
let isGameOver = false;
const BOARD_SIZE = 3;
const MINE_COUNT = 2;

// DOM 元素
const minesweeperSection = document.getElementById('minesweeperSection');
const compressSection = document.getElementById('compressSection');
const minesweeperBtn = document.getElementById('minesweeperBtn');
const compressBtn = document.getElementById('compressBtn');
const minesweeperBoard = document.getElementById('minesweeperBoard');
const newGameBtn = document.getElementById('newGameBtn');
const mineCountDisplay = document.getElementById('mineCount');

// 导航按钮事件
minesweeperBtn.addEventListener('click', () => {
    minesweeperSection.style.display = 'block';
    compressSection.style.display = 'none';
    minesweeperBtn.classList.add('active');
    compressBtn.classList.remove('active');
});

compressBtn.addEventListener('click', () => {
    minesweeperSection.style.display = 'none';
    compressSection.style.display = 'block';
    minesweeperBtn.classList.remove('active');
    compressBtn.classList.add('active');
});

// 初始化游戏
function initGame() {
    gameBoard = [];
    mineLocations = [];
    isGameOver = false;
    mineCountDisplay.textContent = MINE_COUNT;

    // 创建空游戏板
    for (let i = 0; i < BOARD_SIZE; i++) {
        gameBoard[i] = [];
        for (let j = 0; j < BOARD_SIZE; j++) {
            gameBoard[i][j] = {
                isMine: false,
                isRevealed: false,
                isFlagged: false,
                neighborMines: 0
            };
        }
    }

    // 随机放置地雷
    let minesPlaced = 0;
    while (minesPlaced < MINE_COUNT) {
        const row = Math.floor(Math.random() * BOARD_SIZE);
        const col = Math.floor(Math.random() * BOARD_SIZE);
        if (!gameBoard[row][col].isMine) {
            gameBoard[row][col].isMine = true;
            mineLocations.push({row, col});
            minesPlaced++;
        }
    }

    // 计算每个格子周围的地雷数
    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            if (!gameBoard[i][j].isMine) {
                gameBoard[i][j].neighborMines = countNeighborMines(i, j);
            }
        }
    }

    // 渲染游戏板
    renderBoard();
}

// 计算周围地雷数
function countNeighborMines(row, col) {
    let count = 0;
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            const newRow = row + i;
            const newCol = col + j;
            if (newRow >= 0 && newRow < BOARD_SIZE && 
                newCol >= 0 && newCol < BOARD_SIZE &&
                gameBoard[newRow][newCol].isMine) {
                count++;
            }
        }
    }
    return count;
}

// 渲染游戏板
function renderBoard() {
    minesweeperBoard.innerHTML = '';
    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            const cell = document.createElement('button');
            cell.className = 'cell';
            cell.dataset.row = i;
            cell.dataset.col = j;

            if (gameBoard[i][j].isRevealed) {
                cell.classList.add('revealed');
                if (gameBoard[i][j].isMine) {
                    cell.classList.add('mine');
                    cell.textContent = '💣';
                } else {
                    const count = gameBoard[i][j].neighborMines;
                    if (count > 0) {
                        cell.textContent = count;
                    }
                }
            } else if (gameBoard[i][j].isFlagged) {
                cell.classList.add('flagged');
                cell.textContent = '🚩';
            }

            cell.addEventListener('click', handleCellClick);
            cell.addEventListener('contextmenu', handleRightClick);
            minesweeperBoard.appendChild(cell);
        }
    }
}

// 处理左键点击
function handleCellClick(e) {
    if (isGameOver) return;
    
    const row = parseInt(e.target.dataset.row);
    const col = parseInt(e.target.dataset.col);
    
    if (gameBoard[row][col].isFlagged) return;
    
    if (gameBoard[row][col].isMine) {
        gameOver(false);
    } else {
        revealCell(row, col);
        if (checkWin()) {
            gameOver(true);
        }
    }
    
    renderBoard();
}

// 处理右键点击（插旗）
function handleRightClick(e) {
    e.preventDefault();
    if (isGameOver) return;
    
    const row = parseInt(e.target.dataset.row);
    const col = parseInt(e.target.dataset.col);
    
    if (!gameBoard[row][col].isRevealed) {
        gameBoard[row][col].isFlagged = !gameBoard[row][col].isFlagged;
        const flaggedCount = countFlags();
        mineCountDisplay.textContent = MINE_COUNT - flaggedCount;
        renderBoard();
    }
}

// 计算已插旗数量
function countFlags() {
    let count = 0;
    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            if (gameBoard[i][j].isFlagged) count++;
        }
    }
    return count;
}

// 揭示格子
function revealCell(row, col) {
    if (row < 0 || row >= BOARD_SIZE || col < 0 || col >= BOARD_SIZE ||
        gameBoard[row][col].isRevealed || gameBoard[row][col].isFlagged) {
        return;
    }
    
    gameBoard[row][col].isRevealed = true;
    
    if (gameBoard[row][col].neighborMines === 0) {
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                revealCell(row + i, col + j);
            }
        }
    }
}

// 检查是否胜利
function checkWin() {
    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            if (!gameBoard[i][j].isMine && !gameBoard[i][j].isRevealed) {
                return false;
            }
        }
    }
    return true;
}

// 游戏结束
function gameOver(isWin) {
    isGameOver = true;
    // 显示所有地雷
    mineLocations.forEach(({row, col}) => {
        gameBoard[row][col].isRevealed = true;
    });
    
    setTimeout(() => {
        alert(isWin ? '恭喜你赢了！' : '游戏结束！');
    }, 100);
}

// 新游戏按钮事件
newGameBtn.addEventListener('click', initGame);

// 阻止右键菜单
minesweeperBoard.addEventListener('contextmenu', e => e.preventDefault());

// 初始化游戏
initGame(); 