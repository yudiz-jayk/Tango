const { generatePuzzle } = require('../common/servicies')

const initializeGame = (difficulty = 'easy') => {
    const gameData = generatePuzzle(difficulty)
    return gameData
}

module.exports = {
    initializeGame
}
