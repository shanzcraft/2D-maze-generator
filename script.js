const canvas = document.getElementById('mazeCanvas');
const ctx = canvas.getContext('2d');
const solutionCanvas = document.getElementById('solutionCanvas');
const solutionCtx = solutionCanvas.getContext('2d');

const elements = {
    mazeType: document.getElementById('mazeType'),
    mazeShape: document.getElementById('mazeShape'),
    gridSize: document.getElementById('gridSize'),
    lineThickness: document.getElementById('lineThickness'),
    thicknessValue: document.getElementById('thicknessValue'),
    generateBtn: document.getElementById('generateBtn'),
    solveBtn: document.getElementById('solveBtn'),
    exportBtn: document.getElementById('exportBtn'),
    infoTitle: document.getElementById('infoTitle'),
    infoText: document.getElementById('infoText')
};

let currentMaze = null;
let lineThickness = 3;
let solutionVisible = false;

// Returns true if the cell at grid position (x, y) has its center inside the given shape
function isCellInsideShape(x, y, shape, gridSize, canvasSize) {
    const cell = canvasSize / gridSize;
    const centerX = x * cell + cell / 2;
    const centerY = y * cell + cell / 2;
    return ShapeDefinitions[shape].isInside(centerX, centerY, gridSize, canvasSize);
}

// Finds the topmost, then leftmost active cell — consistent "upper-left" entry across all shapes
function findEntryPoint(maze, size) {
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            if (maze[y][x].active) return { x, y };
        }
    }
    return { x: 0, y: 0 };
}

// Uses the geometric center cell as the exit & falls back to nearest active cell if needed
function findExitPoint(maze, size) {
    const cx = Math.floor(size / 2);
    const cy = Math.floor(size / 2);
    if (maze[cy][cx].active) return { x: cx, y: cy };

    // Spiral outward from center to find nearest active cell
    for (let r = 1; r < size; r++) {
        for (let dy = -r; dy <= r; dy++) {
            for (let dx = -r; dx <= r; dx++) {
                const nx = cx + dx, ny = cy + dy;
                if (nx >= 0 && nx < size && ny >= 0 && ny < size && maze[ny][nx].active) {
                    return { x: nx, y: ny };
                }
            }
        }
    }
    return { x: cx, y: cy };
}

elements.lineThickness.addEventListener('input', (e) => {
    lineThickness = parseInt(e.target.value);
    elements.thicknessValue.textContent = lineThickness;
    updateMaze();
});

function drawMaze() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const size = Math.min(200, Math.max(20, parseInt(elements.gridSize.value)));
    elements.gridSize.value = size;
    const shape = elements.mazeShape.value;
    const isMultiply = elements.mazeType.value === 'multiply';

    // Draw shape outline before maze walls
    // ShapeDefinitions[shape].drawOutline(ctx, canvas.width);

    const cell = canvas.width / size;
    const maze = generateMaze(size, size, shape);

    if (isMultiply) {
        // Add loops to create a multiply-connected maze
        const loopsToAdd = Math.floor(size * 0.5);
        for (let i = 0; i < loopsToAdd; i++) {
            const x = Math.floor(Math.random() * (size - 1));
            const y = Math.floor(Math.random() * (size - 1));
            if (maze[y][x].active) {
                if (maze[y][x].walls.right && x + 1 < size && maze[y][x + 1].active) {
                    maze[y][x].walls.right = false;
                    maze[y][x + 1].walls.left = false;
                } else if (maze[y][x].walls.bottom && y + 1 < size && maze[y + 1][x].active) {
                    maze[y][x].walls.bottom = false;
                    maze[y + 1][x].walls.top = false;
                }
            }
        }
    }

    ctx.strokeStyle = '#e8e4d9';
    ctx.lineWidth = lineThickness;
    drawMazeWalls(maze, size, cell);

    // Compute entry and exit dynamically from the active cell layout
    const entry = findEntryPoint(maze, size);
    const exit = findExitPoint(maze, size);

    // Entrance marker (orange)
    ctx.fillStyle = '#e76f51';
    ctx.beginPath();
    ctx.arc(entry.x * cell + cell / 2, entry.y * cell + cell / 2, cell / 3, 0, Math.PI * 2);
    ctx.fill();

    // Goal marker (blue)
    ctx.fillStyle = '#4dabf7';
    ctx.beginPath();
    ctx.arc(exit.x * cell + cell / 2, exit.y * cell + cell / 2, cell / 3, 0, Math.PI * 2);
    ctx.fill();

    currentMaze = { maze, size, cell, entryX: entry.x, entryY: entry.y, goalX: exit.x, goalY: exit.y, shape };
}

function drawMazeWalls(maze, size, cell) {
    ctx.lineCap = 'square';
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            if (!maze[y][x].active) continue;
            const px = x * cell;
            const py = y * cell;
            const w = maze[y][x].walls;
            if (w.top)    { ctx.beginPath(); ctx.moveTo(px,        py);        ctx.lineTo(px + cell, py);        ctx.stroke(); }
            if (w.right)  { ctx.beginPath(); ctx.moveTo(px + cell, py);        ctx.lineTo(px + cell, py + cell); ctx.stroke(); }
            if (w.bottom) { ctx.beginPath(); ctx.moveTo(px,        py + cell); ctx.lineTo(px + cell, py + cell); ctx.stroke(); }
            if (w.left)   { ctx.beginPath(); ctx.moveTo(px,        py);        ctx.lineTo(px,        py + cell); ctx.stroke(); }
        }
    }
    ctx.lineCap = 'butt'; 
}

function generateMaze(cols, rows, shape) {
    if (solutionVisible) {
        solutionCtx.clearRect(0, 0, solutionCanvas.width, solutionCanvas.height);
        solutionVisible = false;
        elements.solveBtn.textContent = 'Show Solution';
    }

    const maze = Array(rows).fill().map(() =>
        Array(cols).fill().map(() => ({
            walls: { top: true, right: true, bottom: true, left: true },
            visited: false,
            active: false
        }))
    );

    // Mark cells inside the shape as active
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            maze[y][x].active = isCellInsideShape(x, y, shape, cols, canvas.width);
        }
    }

    // Start generation from the top left active cell (same as entry point)
    const start = findEntryPoint(maze, cols);

    const stack = [start];
    maze[start.y][start.x].visited = true;

    while (stack.length) {
        const current = stack[stack.length - 1];
        const neighbors = getUnvisitedNeighbors(current, maze, cols, rows);
        if (neighbors.length) {
            const next = neighbors[Math.floor(Math.random() * neighbors.length)];
            removeWall(current, next, maze);
            maze[next.y][next.x].visited = true;
            stack.push(next);
        } else {
            stack.pop();
        }
    }

    return maze;
}

function getUnvisitedNeighbors(c, maze, cols, rows) {
    const n = [];
    if (c.y > 0        && !maze[c.y - 1][c.x].visited && maze[c.y - 1][c.x].active) n.push({ x: c.x,     y: c.y - 1, dir: 'top'    });
    if (c.x < cols - 1 && !maze[c.y][c.x + 1].visited && maze[c.y][c.x + 1].active) n.push({ x: c.x + 1, y: c.y,     dir: 'right'  });
    if (c.y < rows - 1 && !maze[c.y + 1][c.x].visited && maze[c.y + 1][c.x].active) n.push({ x: c.x,     y: c.y + 1, dir: 'bottom' });
    if (c.x > 0        && !maze[c.y][c.x - 1].visited && maze[c.y][c.x - 1].active) n.push({ x: c.x - 1, y: c.y,     dir: 'left'   });
    return n;
}

function removeWall(c, n, maze) {
    if (n.dir === 'top')    { maze[c.y][c.x].walls.top    = false; maze[n.y][n.x].walls.bottom = false; }
    if (n.dir === 'right')  { maze[c.y][c.x].walls.right  = false; maze[n.y][n.x].walls.left   = false; }
    if (n.dir === 'bottom') { maze[c.y][c.x].walls.bottom = false; maze[n.y][n.x].walls.top    = false; }
    if (n.dir === 'left')   { maze[c.y][c.x].walls.left   = false; maze[n.y][n.x].walls.right  = false; }
}

function toggleSolution() {
    if (!currentMaze) return;

    if (solutionVisible) {
        solutionCtx.clearRect(0, 0, solutionCanvas.width, solutionCanvas.height);
        solutionVisible = false;
        elements.solveBtn.textContent = 'Show Solution';
    } else {
        const path = findMazePath(currentMaze);
        if (!path) return;

        const { cell } = currentMaze;
        solutionCtx.strokeStyle = '#00ff00';
        solutionCtx.lineWidth = lineThickness + 2;
        solutionCtx.lineCap = 'round';
        solutionCtx.beginPath();
        path.forEach((c, i) => {
            const px = c.x * cell + cell / 2;
            const py = c.y * cell + cell / 2;
            if (i === 0) solutionCtx.moveTo(px, py); else solutionCtx.lineTo(px, py);
        });
        solutionCtx.stroke();

        solutionVisible = true;
        elements.solveBtn.textContent = 'Hide Solution';
    }
}

function findMazePath({ maze, size, entryX, entryY, goalX, goalY }) {
    const queue = [{ x: entryX, y: entryY, path: [{ x: entryX, y: entryY }] }];
    const visited = new Set([`${entryX},${entryY}`]);

    while (queue.length) {
        const cur = queue.shift();
        if (cur.x === goalX && cur.y === goalY) return cur.path;

        getMazeNeighbors(cur, maze, size, size).forEach(n => {
            const key = `${n.x},${n.y}`;
            if (!visited.has(key)) {
                visited.add(key);
                queue.push({ x: n.x, y: n.y, path: [...cur.path, n] });
            }
        });
    }
    return null;
}

function getMazeNeighbors(c, maze, cols, rows) {
    const neighbors = [];
    const w = maze[c.y][c.x].walls;
    if (c.y > 0        && !w.top    && maze[c.y - 1][c.x].active) neighbors.push({ x: c.x,     y: c.y - 1 });
    if (c.x < cols - 1 && !w.right  && maze[c.y][c.x + 1].active) neighbors.push({ x: c.x + 1, y: c.y     });
    if (c.y < rows - 1 && !w.bottom && maze[c.y + 1][c.x].active) neighbors.push({ x: c.x,     y: c.y + 1 });
    if (c.x > 0        && !w.left   && maze[c.y][c.x - 1].active) neighbors.push({ x: c.x - 1, y: c.y     });
    return neighbors;
}

function updateMaze() {
    const type = elements.mazeType.value;
    const shape = elements.mazeShape.value;
    const shapeName = ShapeDefinitions[shape].name;

    elements.infoTitle.textContent = `${type === 'simple' ? 'Simply-Connected' : 'Multiply-Connected'} Maze - ${shapeName}`;
    elements.infoText.textContent = type === 'simple'
        ? 'All walls connect to the boundary. These mazes can always be solved with the hand-on-wall method.'
        : "Has multiple solutions, often can't be solved with the hand-on-wall method.";

    currentMaze = null;
    drawMaze();
}

function exportMaze() {
    if (!currentMaze) return;

    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = canvas.width;
    exportCanvas.height = canvas.height;
    const exportCtx = exportCanvas.getContext('2d');

    exportCtx.drawImage(canvas, 0, 0);
    if (solutionVisible) exportCtx.drawImage(solutionCanvas, 0, 0);

    exportCanvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `maze-${currentMaze.shape}-${elements.mazeType.value}-${currentMaze.size}x${currentMaze.size}.png`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
    }, 'image/png');
}

elements.mazeType.addEventListener('change', updateMaze);
elements.mazeShape.addEventListener('change', updateMaze);
elements.gridSize.addEventListener('change', updateMaze);
elements.lineThickness.addEventListener('input', updateMaze);
elements.generateBtn.addEventListener('click', updateMaze);
elements.solveBtn.addEventListener('click', toggleSolution);
elements.exportBtn.addEventListener('click', exportMaze);

updateMaze();
