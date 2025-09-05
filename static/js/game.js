/*
game.js
*/

// Game state
let gameState = {
    currentStage: 1,
    gridSize: 3,
    pieces: [],
    correctOrder: [],
}

document.addEventListener('DOMContentLoaded', function() {
    initGame();
});

function initGame() {
    console.log("Game initialized");
    // actually start the game
    document.getElementById('puzzle-board').innerHTML = 
        '<div style="padding: 100px; text-align: center;">game here</div>';
}

async function loadStage(stageNumber){
    // call api/get-puzzle
    // store in our game state
}

async function validateSolution() {
    // calls api/check-solution with positions
    // expects: {correct: true/false, next_stage: 2}
    // if correct, just call: loadStage(gameState.currentStage + 1)
}

function displayPuzzle(puzzleData){
    // create grid and piece elements
    // use stage, grid size, pieces
}

function setupDragDrop() {
    // after displaying puzzle
    // set up event listeners for drag drop
}

function getCurrentPositions() {
    // called when checking solution
    // return array
    // based on current DOM positions
}


function showMessage() {
    // called to show modal or alert
}
