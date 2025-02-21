const mongoose = require('mongoose');

const tangoSchema = new mongoose.Schema({
    puzzleNumber: {
        type: Number,
        required: true
    },
    grid: [[String]], // 6x6 grid with 'sun', 'moon', or null values
    constraints: {
        equals: [{ // for = signs
            row: Number,
            col: Number
        }],
        opposite: [{ // for × signs
            row: Number,
            col: Number
        }]
    },
    solution: [[String]], // 6x6 grid with complete solution
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Tango = mongoose.model('Tango', tangoSchema);

module.exports = Tango;
