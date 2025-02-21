class BinaryPuzzleGame {
    constructor() {
        this.GRID_SIZE = 6;
        this.SYMBOLS = ['sun', 'moon'];
        this.currentGame = null;
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        document.getElementById('newGameBtn').addEventListener('click', () => this.newGame());
        document.getElementById('checkBtn').addEventListener('click', () => this.checkSolution());
        document.getElementById('showSolutionBtn').addEventListener('click', () => this.showSolution());
    }

    async newGame() {
        const difficulty = document.getElementById('difficulty').value;
        try {
            const response = await fetch(`/api/game/new/${difficulty}`);
            this.currentGame = await response.json();
            this.renderGrid();
            
            const solutionWrapper = document.getElementById('solutionWrapper');
            if (solutionWrapper.style.display === 'block') {
                this.renderSolutionGrid();
            }
            
            this.hideMessage();
        } catch (error) {
            this.showMessage('Failed to start new game', 'error');
        }
    }

    renderGrid() {
        const gridElement = document.getElementById('grid');
        gridElement.innerHTML = '';

        this.currentGame.grid.forEach((row, i) => {
            row.forEach((cell, j) => {
                const cellElement = document.createElement('div');
                cellElement.className = 'cell';
                
                if (cell) {
                    cellElement.className += ' filled';
                    cellElement.textContent = cell === 'sun' ? '☀' : '☾';
                }

                if (!cell) {
                    cellElement.addEventListener('click', () => this.handleCellClick(i, j));
                }

                const constraint = this.findConstraint(i, j);
                if (constraint) {
                    cellElement.className += ' constraint-horizontal ' + constraint;
                }

                gridElement.appendChild(cellElement);
            });
        });
    }

    renderSolutionGrid() {
        const solutionGrid = document.getElementById('solutionGrid');
        solutionGrid.innerHTML = '';
        
        this.currentGame.solution.forEach((row, i) => {
            row.forEach((cell, j) => {
                const cellElement = document.createElement('div');
                cellElement.className = 'cell filled';
                cellElement.textContent = cell === 'sun' ? '☀' : '☾';
                
                const constraint = this.findConstraint(i, j);
                if (constraint) {
                    cellElement.className += ' constraint-horizontal ' + constraint;
                }
                
                solutionGrid.appendChild(cellElement);
            });
        });
    }

    findConstraint(row, col) {
        const hasEquals = this.currentGame.constraints.equals.some(pair => {
            const [first, second] = pair;
            return first.row === row && first.col === col && second.col === col + 1;
        });
        if (hasEquals) return 'equals';

        const hasOpposite = this.currentGame.constraints.opposite.some(pair => {
            const [first, second] = pair;
            return first.row === row && first.col === col && second.col === col + 1;
        });
        if (hasOpposite) return 'opposite';

        return null;
    }

    handleCellClick(row, col) {
        if (!this.currentGame.grid[row][col]) {
            this.currentGame.grid[row][col] = 'sun';
        } else if (this.currentGame.grid[row][col] === 'sun') {
            this.currentGame.grid[row][col] = 'moon';
        } else {
            this.currentGame.grid[row][col] = null;
        }
        this.renderGrid();
    }

    checkSolution() {
        if (!this.currentGame) return;

        const isComplete = this.currentGame.grid.every(row => 
            row.every(cell => cell !== null)
        );

        if (!isComplete) {
            this.showMessage('Please fill all cells before checking', 'error');
            return;
        }

        const isCorrect = JSON.stringify(this.currentGame.grid) === 
                        JSON.stringify(this.currentGame.solution);
        
        this.showMessage(
            isCorrect ? 'Congratulations! Puzzle solved correctly!' : 'Solution is not correct. Keep trying!',
            isCorrect ? 'success' : 'error'
        );
    }

    showSolution() {
        if (!this.currentGame || !this.currentGame.solution) return;
        
        document.getElementById('solutionWrapper').style.display = 'block';
        this.renderSolutionGrid();
        
        const solutionBtn = document.getElementById('showSolutionBtn');
        solutionBtn.textContent = 'Hide Solution';
        solutionBtn.removeEventListener('click', () => this.showSolution());
        solutionBtn.addEventListener('click', () => this.hideSolution());
    }

    hideSolution() {
        document.getElementById('solutionWrapper').style.display = 'none';
        
        const solutionBtn = document.getElementById('showSolutionBtn');
        solutionBtn.textContent = 'Show Solution';
        solutionBtn.removeEventListener('click', () => this.hideSolution());
        solutionBtn.addEventListener('click', () => this.showSolution());
    }

    showMessage(text, type) {
        const messageEl = document.getElementById('message');
        messageEl.textContent = text;
        messageEl.className = `message ${type}`;
        messageEl.style.display = 'block';
    }

    hideMessage() {
        const messageEl = document.getElementById('message');
        messageEl.style.display = 'none';
    }
}

// Initialize game when page loads
window.onload = () => {
    const game = new BinaryPuzzleGame();
    game.newGame();
}; 