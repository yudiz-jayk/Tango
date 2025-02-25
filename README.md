# Tango

## Example: 2x2 Grid Puzzle Generation Process

### Call Stack Evolution for Puzzle Generation

1. **Starting Position (Empty Grid)**
[, ]
[, ]


2. **First Call - Position 0**
Stack Frame 1: solve(0)
[?, ] // Trying position 0
[, ]
Try: 0 ✅
[0, ]
[, ]



3. **Second Call - Position 1**
Stack Frame 2: solve(1)
Stack Frame 1: solve(0)
[0, ?]
[, ]
Try: 0 ❌ Invalid (Row unbalanced)
[0, 0]
[, ]
Try: 1 ✅
[0, 1]
[, ]



4. **Third Call - Position 2**
Stack Frame 3: solve(2)
Stack Frame 2: solve(1)
Stack Frame 1: solve(0)
[0, 1]
[?, ]
Try: 0 → Continue
[0, 1]
[0, ]



5. **Fourth Call - Position 3**
Stack Frame 4: solve(3)
Stack Frame 3: solve(2)
Stack Frame 2: solve(1)
Stack Frame 1: solve(0)
[0, 1]
[0, ?]
Try: 0 ❌ Invalid
[0, 1]
[0, 0]
Try: 1 ❌ Invalid (Column unbalanced)
[0, 1]
[0, 1]


7. **Final Position - Success**
Stack Frame 4: solve(3)
Stack Frame 3: solve(2)
Stack Frame 2: solve(1)
Stack Frame 1: solve(0)
[0, 1]
[1, ?]
Try: 0 ✅ Valid Solution!
[0, 1]
[1, 0]