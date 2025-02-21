const { newGameSchema, newGameWithDifficultySchema } = require('./schema')
const { initializeGame } = require('./services')

async function routes(fastify, options) {
    // Initialize new game with easy difficulty
    fastify.get('/api/game/new', {
        schema: newGameSchema,
        handler: async (request, reply) => {
            const gameData = initializeGame('easy')
            return gameData
        }
    })

    // Initialize new game with specified difficulty
    fastify.get('/api/game/new/:difficulty', {
        schema: newGameWithDifficultySchema,
        handler: async (request, reply) => {
            const { difficulty } = request.params
            const gameData = initializeGame(difficulty)
            return gameData
        }
    })
}

module.exports = routes
