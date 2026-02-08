const canvas = document.getElementById('mazeCanvas');
const ctx = canvas.getContext('2d');
const solutionCanvas = document.getElementById('solutionCanvas');
const solutionCtx = solutionCanvas.getContext('2d');

const elements = {
    mazeType: document.getElementById('mazeType'),
    gridSize: document.getElementById('gridSize'),
    lineThickness: document.getElementById('lineThickness'),
    thicknessValue: document.getElementById('thicknessValue'),
    generateBtn: document.getElementById('generateBtn'),
    solveBtn: document.getElementById('solveBtn'),
    infoTitle: document.getElementById('infoTitle'),
    infoText: document.getElementById('infoText')
};

let currentMaze = null;
let lineThickness = 3;
let solutionVisible = false;

elements.lineThickness.addEventListener('input', (e) => {
    lineThickness = parseInt(e.target.value);
    elements.thicknessValue.textContent = lineThickness;
    updateMaze();
});

function drawGrid(size) {
    const cell = canvas.width / size;
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= size; i++) {
        ctx.beginPath();
        ctx.moveTo(i * cell, 0);
        ctx.lineTo(i * cell, canvas.height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * cell);
        ctx.lineTo(canvas.width, i * cell);
        ctx.stroke();
    }
}

function drawSimplyConnectedMaze() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const size = parseInt(elements.gridSize.value);
    drawGrid(size);
    const cell = canvas.width / size;
    const maze = generateMaze(size, size);

    ctx.strokeStyle = '#e8e4d9';
    ctx.lineWidth = lineThickness;
    drawMazeWalls(maze, size, cell);

    // Entrance 
    ctx.fillStyle = '#e76f51';
    ctx.beginPath();
    ctx.arc(cell/2, cell/2, cell/3, 0, Math.PI*2);
    ctx.fill();

    // Goal in center
    const goalX = Math.floor(size/2);
    const goalY = Math.floor(size/2);
    ctx.fillStyle = '#4dabf7';
    ctx.beginPath();
    ctx.arc(goalX*cell + cell/2, goalY*cell + cell/2, cell/3, 0, Math.PI*2);
    ctx.fill();

    currentMaze = { maze, size, cell, goalX, goalY };
}

function drawMultiplyConnectedMaze() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const size = parseInt(elements.gridSize.value);
    drawGrid(size);
    const cell = canvas.width / size;
    const maze = generateMaze(size, size);

    const loopsToAdd = Math.floor(size * 0.5);
    for (let i = 0; i < loopsToAdd; i++) {
        const x = Math.floor(Math.random() * (size - 1));
        const y = Math.floor(Math.random() * (size - 1));
        if (maze[y][x].walls.right) {
            maze[y][x].walls.right = false;
            maze[y][x + 1].walls.left = false;
        } else if (maze[y][x].walls.bottom) {
            maze[y][x].walls.bottom = false;
            maze[y + 1][x].walls.top = false;
        }
    }

    ctx.strokeStyle = '#e8e4d9';
    ctx.lineWidth = lineThickness;
    drawMazeWalls(maze, size, cell);

    // Entrance
    ctx.fillStyle = '#e76f51';
    ctx.beginPath();
    ctx.arc(cell/2, cell/2, cell/3, 0, Math.PI*2);
    ctx.fill();

    // Goal in center
    const goalX = Math.floor(size/2);
    const goalY = Math.floor(size/2);
    ctx.fillStyle = '#4dabf7';
    ctx.beginPath();
    ctx.arc(goalX*cell + cell/2, goalY*cell + cell/2, cell/3, 0, Math.PI*2);
    ctx.fill();

    currentMaze = { maze, size, cell, goalX, goalY };
}

function drawMazeWalls(maze, size, cell) {
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const px = x * cell;
            const py = y * cell;
            const w = maze[y][x].walls;
            if (w.top) { ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + cell, py); ctx.stroke(); }
            if (w.right) { ctx.beginPath(); ctx.moveTo(px + cell, py); ctx.lineTo(px + cell, py + cell); ctx.stroke(); }
            if (w.bottom) { ctx.beginPath(); ctx.moveTo(px, py + cell); ctx.lineTo(px + cell, py + cell); ctx.stroke(); }
            if (w.left) { ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px, py + cell); ctx.stroke(); }
        }
    }
}

function generateMaze(cols, rows) {
    if (solutionVisible) {
        // Hide solution
        solutionCtx.clearRect(0, 0, solutionCanvas.width, solutionCanvas.height);
        solutionVisible = false;
        elements.solveBtn.textContent = 'Show Solution';
    }

    const maze = Array(rows).fill().map(() => 
        Array(cols).fill().map(() => ({ walls: { top: true, right: true, bottom: true, left: true }, visited: false }))
    );
    const stack = [{ x: 0, y: 0 }];
    maze[0][0].visited = true;

    while (stack.length) {
        const current = stack[stack.length - 1];
        const neighbors = getUnvisitedNeighbors(current, maze, cols, rows);
        if (neighbors.length) {
            const next = neighbors[Math.floor(Math.random() * neighbors.length)];
            removeWall(current, next, maze);
            maze[next.y][next.x].visited = true;
            stack.push(next);
        } else stack.pop();
    }

    return maze;
}

function getUnvisitedNeighbors(c, maze, cols, rows) {
    const n = [];
    if (c.y > 0 && !maze[c.y-1][c.x].visited) n.push({ x:c.x, y:c.y-1, dir:'top' });
    if (c.x < cols-1 && !maze[c.y][c.x+1].visited) n.push({ x:c.x+1, y:c.y, dir:'right' });
    if (c.y < rows-1 && !maze[c.y+1][c.x].visited) n.push({ x:c.x, y:c.y+1, dir:'bottom' });
    if (c.x > 0 && !maze[c.y][c.x-1].visited) n.push({ x:c.x-1, y:c.y, dir:'left' });
    return n;
}

function removeWall(c, n, maze) {
    if (n.dir === 'top') { maze[c.y][c.x].walls.top=false; maze[n.y][n.x].walls.bottom=false; }
    if (n.dir === 'right') { maze[c.y][c.x].walls.right=false; maze[n.y][n.x].walls.left=false; }
    if (n.dir === 'bottom') { maze[c.y][c.x].walls.bottom=false; maze[n.y][n.x].walls.top=false; }
    if (n.dir === 'left') { maze[c.y][c.x].walls.left=false; maze[n.y][n.x].walls.right=false; }
}

function toggleSolution() {
    if (!currentMaze) return;
    
    if (solutionVisible) {
        // Hide solution
        solutionCtx.clearRect(0, 0, solutionCanvas.width, solutionCanvas.height);
        solutionVisible = false;
        elements.solveBtn.textContent = 'Show Solution';
    } else {
        // Show solution
        const { maze, size, cell } = currentMaze;
        const path = findMazePath(currentMaze);
        if (!path) return;

        solutionCtx.strokeStyle = '#00ff00';
        solutionCtx.lineWidth = lineThickness + 2;
        solutionCtx.lineCap = 'round';
        solutionCtx.beginPath();
        path.forEach((c, i) => {
            const px = c.x * cell + cell/2;
            const py = c.y * cell + cell/2;
            if(i===0) solutionCtx.moveTo(px, py); else solutionCtx.lineTo(px, py);
        });
        solutionCtx.stroke();
        
        solutionVisible = true;
        elements.solveBtn.textContent = 'Hide Solution';
    }
}

function findMazePath({ maze, size, goalX, goalY }) {
    const queue = [{ x:0, y:0, path:[{x:0,y:0}] }];
    const visited = new Set(['0,0']);
    const goal = { x: goalX, y: goalY };

    while(queue.length) {
        const cur = queue.shift();
        if(cur.x===goal.x && cur.y===goal.y) return cur.path;

        getMazeNeighbors(cur, maze, size, size).forEach(n=>{
            const key = `${n.x},${n.y}`;
            if(!visited.has(key)){
                visited.add(key);
                queue.push({ x:n.x, y:n.y, path:[...cur.path,n] });
            }
        });
    }
    return null;
}

function getMazeNeighbors(c, maze, cols, rows) {
    const neighbors=[];
    const w=maze[c.y][c.x].walls;
    if(c.y>0 && !w.top) neighbors.push({x:c.x,y:c.y-1});
    if(c.x<cols-1 && !w.right) neighbors.push({x:c.x+1,y:c.y});
    if(c.y<rows-1 && !w.bottom) neighbors.push({x:c.x,y:c.y+1});
    if(c.x>0 && !w.left) neighbors.push({x:c.x-1,y:c.y});
    return neighbors;
}

function updateMaze() {
    const type = elements.mazeType.value;
    elements.infoTitle.textContent = type==='simple' ? 'Simply-Connected Maze' : 'Multiply-Connected Maze';
    elements.infoText.textContent = type==='simple' ? 
        'All walls connect to the boundary. These mazes can always be solved with the hand-on-wall method.' :
        "Has multiple solutions, often can't be solved with the hand-on-wall method.";

    currentMaze=null;
    if(type==='simple') drawSimplyConnectedMaze();
    else drawMultiplyConnectedMaze();
}

elements.mazeType.addEventListener('change', updateMaze);
elements.gridSize.addEventListener('change', updateMaze);
elements.lineThickness.addEventListener('input', updateMaze);
elements.generateBtn.addEventListener('click', updateMaze);
elements.solveBtn.addEventListener('click', toggleSolution);

updateMaze();