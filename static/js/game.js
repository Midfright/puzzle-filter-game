// Game state
let gameState = {
};

document.addEventListener('DOMContentLoaded', function() {
    initGame();
});

function initGame() {
    console.log("Game initialized");
    
    document.getElementById('puzzle-board').innerHTML = 
        '<div style="padding: 100px; text-align: center;">game here</div>';
}

/* functions we might need
- drag
- drop
- startNewGame
- loadPuzzle
- checkSolution
- resetGame
- scoring functions if we want scores
- timer functions if we do a time limit?
*/