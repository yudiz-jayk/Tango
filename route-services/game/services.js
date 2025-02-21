 
const { generatePuzzle } = require('../common/servicies');

 
const initializeGame = (difficulty = 'easy') => {
    // Generate new game data
    const gameData = generatePuzzle(difficulty);
        
       
        
 
    return gameData;
}

module.exports = {
    initializeGame
}
