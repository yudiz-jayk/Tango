const SYMBOLS = [0, 1];
const GRID_SIZE = 6;

const generateEmptyGrid = () => 
    Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));

const getRandomInt = (max) => 
    Math.floor(Math.random() * max);

const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = getRandomInt(i + 1);
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

const getEmptyPositions = (grid) => {
    const positions = [];
    grid.forEach((row, i) => {
        row.forEach((cell, j) => {
            if (!cell) positions.push([i, j]);
        });
    });
    return positions;
};

const getRandomPosition = (grid) => {
    const emptyPositions = getEmptyPositions(grid);
    return emptyPositions[getRandomInt(emptyPositions.length)];
};

const countSymbolsInArray = (array, symbol) =>
    array.filter(cell => cell === symbol).length;

const getPossibleSymbols = (grid, row, col) => {
    const symbols = [...SYMBOLS];
    const rowCells = grid[row].filter(cell => cell !== null);
    const colCells = grid.map(r => r[col]).filter(cell => cell !== null);

    const maxPerLine = GRID_SIZE / 2;
    
    // Check row balance
    const zerosInRow = countSymbolsInArray(rowCells, 0);
    const onesInRow = countSymbolsInArray(rowCells, 1);
    const remainingInRow = GRID_SIZE - rowCells.length;

    // Check column balance
    const zerosInCol = countSymbolsInArray(colCells, 0);
    const onesInCol = countSymbolsInArray(colCells, 1);
    const remainingInCol = GRID_SIZE - colCells.length;

    // Remove 0 if:
    // 1. Already at max in row/column OR
    // 2. Adding 0 would prevent 1 from reaching required count
    if (zerosInRow >= maxPerLine || zerosInCol >= maxPerLine || 
        onesInCol + remainingInCol <= maxPerLine) {
        symbols.splice(symbols.indexOf(0), 1);
    }

    // Remove 1 if:
    // 1. Already at max in row/column OR
    // 2. Adding 1 would prevent 0 from reaching required count
    if (onesInRow >= maxPerLine || onesInCol >= maxPerLine || 
        zerosInCol + remainingInCol <= maxPerLine) {
        symbols.splice(symbols.indexOf(1), 1);
    }

    // Check horizontal adjacency
    if (col >= 2 && grid[row][col-2] !== null && grid[row][col-1] !== null && 
        grid[row][col-2] === grid[row][col-1]) {
        symbols.splice(symbols.indexOf(grid[row][col-1]), 1);
    }
    if (col >= 1 && col < GRID_SIZE-1 && grid[row][col-1] !== null && grid[row][col+1] !== null && 
        grid[row][col-1] === grid[row][col+1]) {
        symbols.splice(symbols.indexOf(grid[row][col-1]), 1);
    }

    // Check vertical adjacency
    if (row >= 2 && grid[row-2][col] !== null && grid[row-1][col] !== null && 
        grid[row-2][col] === grid[row-1][col]) {
        symbols.splice(symbols.indexOf(grid[row-1][col]), 1);
    }
    if (row >= 1 && row < GRID_SIZE-1 && grid[row-1][col] !== null && grid[row+1][col] !== null && 
        grid[row-1][col] === grid[row+1][col]) {
        symbols.splice(symbols.indexOf(grid[row-1][col]), 1);
    }

    return symbols;
};

const generateSolution = () => {
    const solution = generateEmptyGrid();
    
    const solve = (grid, position = 0) => {
        if (position === GRID_SIZE * GRID_SIZE) return true;
        
        const row = Math.floor(position / GRID_SIZE);
        const col = position % GRID_SIZE;
        
        // Get valid symbols for this position
        const possibleSymbols = getPossibleSymbols(grid, row, col);
        
        // Try each possible symbol (already validated)
        for (const symbol of shuffleArray(possibleSymbols)) {
            grid[row][col] = symbol;
            if (solve(grid, position + 1)) return true;
            grid[row][col] = null;
        }
        
        return false;
    };
    
    if (!solve(solution)) {
        throw new Error('Failed to generate valid solution');
    }
    
    return solution;
};

const isValid = (grid, row, col, symbol) => {
    // Check row balance
    const rowSymbols = grid[row].filter(Boolean);
    const rowCount = countSymbolsInArray(rowSymbols, symbol);
    if (rowCount >= GRID_SIZE / 2) return false;
    
    // Check column balance
    const colSymbols = grid.map(r => r[col]).filter(Boolean);
    const colCount = countSymbolsInArray(colSymbols, symbol);
    const remainingCells = GRID_SIZE - colSymbols.length;
    // If adding this symbol would make it impossible to achieve balance
    if (colCount >= GRID_SIZE / 2 || 
        (remainingCells + colCount < GRID_SIZE / 2)) return false;
    
    // Check horizontal adjacency
    if (col >= 2 && grid[row][col-1] === symbol && grid[row][col-2] === symbol) return false;
    if (col >= 1 && col < GRID_SIZE-1 && grid[row][col-1] === symbol && grid[row][col+1] === symbol) return false;
    
    // Check vertical adjacency
    if (row >= 2 && grid[row-1][col] === symbol && grid[row-2][col] === symbol) return false;
    if (row >= 1 && row < GRID_SIZE-1 && grid[row-1][col] === symbol && grid[row+1][col] === symbol) return false;
    
    return true;
};

const generateConstraints = (solution, difficulty = 'medium') => {
    const constraints = {
        equals: [],
        opposite: []
    };

    // 70% chance to include constraints
    if (Math.random() > 0.7) {
        return constraints;
    }

    // Get max constraints from difficulty settings
    const { maxConstraints } = getDifficultySettings(difficulty);
    
    // Randomly reduce maxConstraints (50-100% of max)
    const actualMaxConstraints = Math.max(
        2,
        Math.floor(maxConstraints * (0.5 + Math.random() * 0.5))
    );

    // Collect both horizontal and vertical constraints
    const equalConstraints = [];
    const oppositeConstraints = [];
    
    // Check horizontal constraints
    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE - 1; j++) {
            if (solution[i][j] !== null && solution[i][j + 1] !== null) {
                const pair = {
                    cells: [
                        { row: i, col: j },
                        { row: i, col: j + 1 }
                    ],
                    direction: 'horizontal'
                };
                
                if (solution[i][j] === solution[i][j + 1]) {
                    equalConstraints.push(pair);
                } else {
                    oppositeConstraints.push(pair);
                }
            }
        }
    }

    // Check vertical constraints
    for (let i = 0; i < GRID_SIZE - 1; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            if (solution[i][j] !== null && solution[i + 1][j] !== null) {
                const pair = {
                    cells: [
                        { row: i, col: j },
                        { row: i + 1, col: j }
                    ],
                    direction: 'vertical'
                };
                
                if (solution[i][j] === solution[i + 1][j]) {
                    equalConstraints.push(pair);
                } else {
                    oppositeConstraints.push(pair);
                }
            }
        }
    }

    // Only proceed if we have at least one of each type
    if (equalConstraints.length === 0 || oppositeConstraints.length === 0) {
        return constraints;
    }

    // Shuffle both arrays
    const shuffledEquals = shuffleArray(equalConstraints);
    const shuffledOpposites = shuffleArray(oppositeConstraints);

    // Ensure at least one of each type
    constraints.equals.push(shuffledEquals[0]);
    constraints.opposite.push(shuffledOpposites[0]);

    // Calculate remaining slots
    const remainingSlots = Math.min(
        actualMaxConstraints - 2,  // -2 because we already added one of each
        shuffledEquals.length + shuffledOpposites.length - 2
    );

    // Randomly distribute remaining slots
    for (let i = 0; i < remainingSlots; i++) {
        const addEquals = Math.random() < 0.5 && 
                         constraints.equals.length < shuffledEquals.length;
        
        if (addEquals) {
            constraints.equals.push(shuffledEquals[constraints.equals.length]);
        } else if (constraints.opposite.length < shuffledOpposites.length) {
            constraints.opposite.push(shuffledOpposites[constraints.opposite.length]);
        }
    }

    return constraints;
};

const getDifficultySettings = (difficulty) => ({
    filledCells: {
        easy: 14,
        medium: 10,
        hard: 7
    }[difficulty] || 10,
    maxConstraints: {
        easy: 4,
        medium: 6,
        hard: 8
    }[difficulty] || 6
});

const generatePuzzle = (difficulty = 'medium') => {
    const solution = generateSolution();
    const grid = generateEmptyGrid();
    const { filledCells } = getDifficultySettings(difficulty);
    
    // Create array of all possible positions
    const positions = [];
    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            positions.push([i, j]);
        }
    }
    
    // Randomly select positions for initial filled cells
    const shuffledPositions = shuffleArray(positions);
    for (let i = 0; i < filledCells; i++) {
        const [row, col] = shuffledPositions[i];
        grid[row][col] = solution[row][col];
    }
    
    const constraints = generateConstraints(solution, difficulty);
    
    return {
        grid,
        solution,
        constraints,
        difficulty
    };
};

const validateRow = (row) => {
    const zeros = countSymbolsInArray(row, 0);
    const ones = countSymbolsInArray(row, 1);
    return zeros === ones;
};

const validateColumn = (grid, colIndex) => {
    const column = grid.map(row => row[colIndex]);
    return validateRow(column);
};

const validatePuzzle = (grid) => ({
    rowsValid: grid.every(validateRow),
    columnsValid: Array(GRID_SIZE).fill().every((_, i) => validateColumn(grid, i)),
    adjacentValid: !grid.some((row, i) => 
        row.some((_, j) => {
            // Check horizontal adjacency
            if (j < GRID_SIZE - 2) {
                if (row[j] === row[j + 1] && row[j + 1] === row[j + 2]) return true;
            }
            // Check vertical adjacency
            if (i < GRID_SIZE - 2) {
                if (grid[i][j] === grid[i + 1][j] && grid[i + 1][j] === grid[i + 2][j]) return true;
            }
            return false;
        })
    )
});

module.exports = {
    generatePuzzle,
    validatePuzzle,
    generateEmptyGrid
};
