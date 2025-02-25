// Tango Puzzle Generator with Logical Deduction and Two Constraints

// Constants
const GRID_SIZE = 6;
const SYMBOLS = [0, 1];

// Helper: Create an empty grid
const generateEmptyGrid = () =>
  Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null));

// Helper: Clone grid (deep copy)
const cloneGrid = grid => grid.map(row => [...row]);

// Helper: Count occurrences of a symbol in an array
const countSymbolsInArray = (array, symbol) =>
  array.filter(cell => cell === symbol).length;

// --- 1. Generate a complete solution using backtracking ---
// The solution obeys all Tango rules (balance, no three adjacent, etc.)
function generateSolution() {
  const grid = generateEmptyGrid();
  const maxPerLine = GRID_SIZE / 2;

  // Check if a symbol can be placed at (row, col)
  const canPlace = (grid, row, col, symbol) => {
    // Row and column balance
    const rowCells = grid[row].filter(cell => cell !== null);
    if (countSymbolsInArray(rowCells, symbol) >= maxPerLine) return false;
    const colCells = grid.map(r => r[col]).filter(cell => cell !== null);
    if (countSymbolsInArray(colCells, symbol) >= maxPerLine) return false;
    
    // Horizontal adjacency (no three in a row)
    if (col >= 2 && grid[row][col - 1] === symbol && grid[row][col - 2] === symbol) return false;
    if (col >= 1 && col < GRID_SIZE - 1 && grid[row][col - 1] === symbol && grid[row][col + 1] === symbol) return false;
    
    // Vertical adjacency
    if (row >= 2 && grid[row - 1][col] === symbol && grid[row - 2][col] === symbol) return false;
    if (row >= 1 && row < GRID_SIZE - 1 && grid[row - 1][col] === symbol && grid[row + 1][col] === symbol) return false;
    
    return true;
  };

  const solve = (position = 0) => {
    if (position === GRID_SIZE * GRID_SIZE) return true;
    const row = Math.floor(position / GRID_SIZE);
    const col = position % GRID_SIZE;
    
    // Randomize symbol order for variety
    const symbols = [...SYMBOLS].sort(() => Math.random() - 0.5);
    for (const symbol of symbols) {
      if (canPlace(grid, row, col, symbol)) {
        grid[row][col] = symbol;
        if (solve(position + 1)) return true;
        grid[row][col] = null;
      }
    }
    return false;
  };

  if (!solve()) throw new Error("Failed to generate a valid solution");
  return grid;
}

// --- 2. Generate constraints from the solution ---
// We extract constraints based on difficulty level
function generateConstraints(solution, difficulty) {
  const equalConstraints = [];
  const oppositeConstraints = [];
  
  // Check horizontal adjacent pairs
  for (let i = 0; i < GRID_SIZE; i++) {
    for (let j = 0; j < GRID_SIZE - 1; j++) {
      if (solution[i][j] !== null && solution[i][j+1] !== null) {
        const pair = {
          cells: [{ row: i, col: j }, { row: i, col: j + 1 }],
          direction: 'horizontal'
        };
        if (solution[i][j] === solution[i][j+1]) {
          equalConstraints.push(pair);
        } else {
          oppositeConstraints.push(pair);
        }
      }
    }
  }
  
  // Check vertical adjacent pairs
  for (let i = 0; i < GRID_SIZE - 1; i++) {
    for (let j = 0; j < GRID_SIZE; j++) {
      if (solution[i][j] !== null && solution[i+1][j] !== null) {
        const pair = {
          cells: [{ row: i, col: j }, { row: i + 1, col: j }],
          direction: 'vertical'
        };
        if (solution[i][j] === solution[i+1][j]) {
          equalConstraints.push(pair);
        } else {
          oppositeConstraints.push(pair);
        }
      }
    }
  }
  
  // Shuffle arrays for randomness
  const shuffledEquals = equalConstraints.sort(() => Math.random() - 0.5);
  const shuffledOpposites = oppositeConstraints.sort(() => Math.random() - 0.5);
  
  const constraints = { equals: [], opposite: [] };
  
  // Adjust constraints based on difficulty
  if (difficulty === 'easy') {
    // Easy: 1 constraint of each type
    if (shuffledEquals.length > 0) constraints.equals.push(...shuffledEquals.slice(0, 1));
    if (shuffledOpposites.length > 0) constraints.opposite.push(...shuffledOpposites.slice(0, 1));
  } else if (difficulty === 'medium') {
    // Medium: 2 constraints of each type
    if (shuffledEquals.length > 1) constraints.equals.push(...shuffledEquals.slice(0, 1));
    if (shuffledOpposites.length > 1) constraints.opposite.push(...shuffledOpposites.slice(0, 1));
  } else if (difficulty === 'hard') {
    // Hard: 3 constraints of each type
    if (shuffledEquals.length > 2) constraints.equals.push(...shuffledEquals.slice(0, 1));
    if (shuffledOpposites.length > 2) constraints.opposite.push(...shuffledOpposites.slice(0, 1));
  }
  
  return constraints;
}

// --- 3. Logical Deduction Solver ---
// Simulates human-like step-by-step deduction (no guessing)
// Rules applied: balance rule, adjacency rule, and constraint propagation.
function solveLogically(puzzle) {
  const grid = cloneGrid(puzzle.grid);
  let progress = true;

  // Rule: Balance – if half the cells in a row/column are one symbol, fill the rest with the opposite.
  const applyBalanceRule = () => {
    let changed = false;
    // Rows
    for (let i = 0; i < GRID_SIZE; i++) {
      const row = grid[i];
      if (row.filter(cell => cell !== null).length < GRID_SIZE) {
        for (const symbol of SYMBOLS) {
          if (countSymbolsInArray(row, symbol) === GRID_SIZE / 2) {
            row.forEach((cell, j) => {
              if (cell === null) {
                grid[i][j] = SYMBOLS.find(s => s !== symbol);
                changed = true;
              }
            });
          }
        }
      }
    }
    // Columns
    for (let j = 0; j < GRID_SIZE; j++) {
      const col = grid.map(row => row[j]);
      if (col.filter(cell => cell !== null).length < GRID_SIZE) {
        for (const symbol of SYMBOLS) {
          if (countSymbolsInArray(col, symbol) === GRID_SIZE / 2) {
            grid.forEach((row, i) => {
              if (grid[i][j] === null) {
                grid[i][j] = SYMBOLS.find(s => s !== symbol);
                changed = true;
              }
            });
          }
        }
      }
    }
    return changed;
  };

  // Rule: Adjacency – avoid three of the same symbol consecutively.
  const applyAdjacencyRule = () => {
    let changed = false;
    // Horizontal
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE - 2; j++) {
        if (grid[i][j] !== null && grid[i][j] === grid[i][j+1] && grid[i][j+2] === null) {
          grid[i][j+2] = SYMBOLS.find(s => s !== grid[i][j]);
          changed = true;
        }
      }
    }
    // Vertical
    for (let j = 0; j < GRID_SIZE; j++) {
      for (let i = 0; i < GRID_SIZE - 2; i++) {
        if (grid[i][j] !== null && grid[i][j] === grid[i+1][j] && grid[i+2][j] === null) {
          grid[i+2][j] = SYMBOLS.find(s => s !== grid[i][j]);
          changed = true;
        }
      }
    }
    return changed;
  };

  // Rule: Constraint propagation – apply equals and opposite clues.
  const applyConstraintRules = () => {
    let changed = false;
    // Equals constraints: if one cell is filled, the partner must match.
    for (const cons of puzzle.constraints.equals) {
      const [a, b] = cons.cells;
      if (grid[a.row][a.col] !== null && grid[b.row][b.col] === null) {
        grid[b.row][b.col] = grid[a.row][a.col];
        changed = true;
      } else if (grid[b.row][b.col] !== null && grid[a.row][a.col] === null) {
        grid[a.row][a.col] = grid[b.row][b.col];
        changed = true;
      }
    }
    // Opposite constraints: if one cell is filled, the partner must be the opposite.
    for (const cons of puzzle.constraints.opposite) {
      const [a, b] = cons.cells;
      if (grid[a.row][a.col] !== null && grid[b.row][b.col] === null) {
        grid[b.row][b.col] = SYMBOLS.find(s => s !== grid[a.row][a.col]);
        changed = true;
      } else if (grid[b.row][b.col] !== null && grid[a.row][a.col] === null) {
        grid[a.row][a.col] = SYMBOLS.find(s => s !== grid[b.row][b.col]);
        changed = true;
      }
    }
    return changed;
  };

  // Iteratively apply all deduction rules until no further changes occur.
  while (progress) {
    progress = false;
    if (applyBalanceRule()) progress = true;
    if (applyAdjacencyRule()) progress = true;
    if (applyConstraintRules()) progress = true;
  }

  const complete = grid.flat().every(cell => cell !== null);
  return { solvedGrid: grid, complete };
}

// --- 4. Reduce clues to a target number while ensuring logical solvability ---
// Start with the full solution and remove cells one by one. After each removal,
// use the deduction solver to verify that the puzzle can still be completed logically.
function reduceClues(solution, constraints, targetClues) {
  let clueGrid = cloneGrid(solution);
  
  // Create an array of all cell positions
  const positions = [];
  for (let i = 0; i < GRID_SIZE; i++) {
    for (let j = 0; j < GRID_SIZE; j++) {
      positions.push({ row: i, col: j });
    }
  }
  // Shuffle positions randomly
  positions.sort(() => Math.random() - 0.5);
  
  for (const pos of positions) {
    const filledCount = clueGrid.flat().filter(cell => cell !== null).length;
    if (filledCount <= targetClues) break; // Stop if reduced to the target count
    
    const temp = clueGrid[pos.row][pos.col];
    clueGrid[pos.row][pos.col] = null;
    
    // Test logical solvability on the modified grid
    const tempPuzzle = { grid: cloneGrid(clueGrid), constraints };
    const result = solveLogically(tempPuzzle);
    if (!result.complete) {
      // Revert removal if the puzzle isn't solvable logically without guessing
      clueGrid[pos.row][pos.col] = temp;
    }
  }
  
  return clueGrid;
}

// --- 5. Generate final puzzle ---
// Combines all pieces: a full solution, constraints, and prefilled clues based on difficulty.
function generatePuzzle(difficulty = 'medium') {
  const solution = generateSolution();
  const constraints = generateConstraints(solution, difficulty);
  
  // Adjust target clues based on difficulty
  let targetClues;
  if (difficulty === 'easy') {
    targetClues = 12; // More clues for easier puzzles
  } else if (difficulty === 'medium') {
    targetClues = 8; // Moderate clues for medium puzzles
  } else if (difficulty === 'hard') {
    targetClues = 4; // Fewer clues for harder puzzles
  }
  
  const grid = reduceClues(solution, constraints, targetClues);
  
  return {
    grid,         // Puzzle grid with prefilled clues
    solution,     // Full solution grid
    constraints,  // Constraints based on difficulty
    difficulty    // Difficulty level
  };
}

module.exports = {
  generatePuzzle
};