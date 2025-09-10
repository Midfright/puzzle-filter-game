/*
game.js
*/

// =============================================================================
// API Object
// =============================================================================
const API = {
    async getPuzzle(stage, crazy) {
        // fetch puzzle data from backend
        const response = await fetch(`/api/get-puzzle/${stage}?crazy=${crazy}`);
        if (!response.ok) {
            throw new Error('Failed to fetch puzzle');
        }
        return response.json();
    },
    
    async validateSolution(positions, correctOrder, stage) {
        // sends solution to backend
        const response = await fetch('/api/validate-solution', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                cur_pos: positions, 
                orig_pos: correctOrder,
                stage_num: stage 
            })
        });
        if (!response.ok) {
            throw new Error('Failed to validate solution');
        }
        return response.json();
    }
};

// =============================================================================
// Testing functions
// =============================================================================

function addTestControls() {
    const testDiv = document.createElement('div');
    testDiv.innerHTML = `
        <div class="position-fixed bottom-0 end-0 p-3" style="z-index: 1000;">
            <button class="btn btn-sm btn-warning" onclick="testAutoSolve()">Auto Solve</button>
        </div>
    `;
    document.body.appendChild(testDiv);
}

function testAutoSolve() {

    const slots = document.querySelectorAll('.grid-slot');
    const pieces = document.querySelectorAll('.puzzle-piece');
    
    pieces.forEach(piece => {
        const correctPosition = parseInt(piece.dataset.pieceId);
        if (slots[correctPosition]) {
            slots[correctPosition].appendChild(piece);
            piece.dataset.location = 'board';
            piece.classList.add('in-grid');
        }
    });
}

// =============================================================================
// Game state
// =============================================================================

let gameState = {
    currentStage: 1,
    maxStages: 5,
    gridSize: 3,
    shuffledPieces: [],
    correctOrder: [],
    boardState: [],
    crazyMode: false,
    origImage: null
}

// =============================================================================
// Core Game Functions
// =============================================================================

document.addEventListener('DOMContentLoaded', function() {
    initGame();
});

function initGame() {
    const urlParams = new URLSearchParams(window.location.search);
    gameState.crazyMode = urlParams.get('crazy') === 'true';
    // button events hook
    document.getElementById('validate-btn').addEventListener('click', validateSolution);
    document.getElementById('reset-stage-btn').addEventListener('click', resetCurrentStage);
    addTestControls();
    // start with stage 1
    loadStage(1, gameState.crazyMode);
}

async function loadStage(stageNumber, crazy=false){
    try {
        document.getElementById('puzzle-board').innerHTML = 
            '<div class="text-center p-5"><div class="spinner-border"></div><p>Loading puzzle...</p></div>';
        
        const puzzleData = await API.getPuzzle(stageNumber, crazy);
        
        gameState.currentStage = puzzleData.stage_num || puzzleData.stage;
        gameState.gridSize = puzzleData.grid_size;
        gameState.shuffledPieces = puzzleData.shuffled_pieces;
        gameState.correctOrder = puzzleData.correct_order;
        gameState.crazyMode = crazy;
        gameState.origImage = puzzleData.orig_image;
        
        displayPuzzle(puzzleData);
        
    } catch (error) {
        console.error('Failed to load stage:', error);
        showMessage('Error', 'Failed to load puzzle. Please try again.');
    }
}

function displayPuzzle(puzzleData){
    document.getElementById('current-stage').textContent = puzzleData.stage_num || puzzleData.stage;
    clearBoard();
    
    // indicate mode
    const modeIndicator = document.getElementById('mode-indicator');
    if (modeIndicator && gameState.crazyMode) {
        modeIndicator.textContent = 'CRAZY MODE - ';
    }

    const puzzleBoard = document.getElementById('puzzle-board');
    puzzleBoard.style.setProperty('--grid-size', puzzleData.grid_size);
    puzzleBoard.className = 'puzzle-grid';
    
    // creating grid slots
    for (let row = 0; row < puzzleData.grid_size; row++) {
        for (let col = 0; col < puzzleData.grid_size; col++) {
            puzzleBoard.appendChild(createGridSlot(row, col));
        }
    }
    
    // creating puzzle pieces
    const piecesContainer = document.getElementById('pieces-container');
    puzzleData.shuffled_pieces.forEach(piece => {
        piecesContainer.appendChild(createPieceElement(piece.image_data, piece.id));
    });
    
    gameState.boardState = new Array(puzzleData.grid_size * puzzleData.grid_size).fill(null);
    setupDragDrop();
}


async function validateSolution() {
    // calls api/check-solution with positions
    // expects: {correct: true/false, next_stage: 2}
    // if correct, just call: loadStage(gameState.currentStage + 1)
    try {
        const currentPositions = getCurrentPositions();
        
        if (currentPositions.includes(null)) {
            showMessage('Incomplete', 'Please place all the pieces on the board');
            return;
        }
        
        const result = await API.validateSolution(
            currentPositions, 
            gameState.correctOrder,
            gameState.currentStage
        );
        
        if (result.correct) {
            if (result.next_stage <= 5) {
                showMessage('Stage Complete', 'Keep going!', () => {
                    loadStage(result.next_stage, gameState.crazyMode);
                }, null, gameState.origImage);
            } else {
                showGameComplete();
            }
        } else {
            showMessage('Not Quite Right', "Keep trying!");
        }
        
    } catch (error) {
        console.error('Validation failed:', error);
        showMessage('Error', 'Failed to validate solution. Please try again.');
    }
}

function resetCurrentStage() {
    const puzzleBoard = document.getElementById('puzzle-board');
    const piecesContainer = document.getElementById('pieces-container');
    
    // empty board
    const slots = puzzleBoard.querySelectorAll('.grid-slot');
    slots.forEach(slot => {
        if (slot.firstChild) {
            slot.removeChild(slot.firstChild);
        }
    });

    piecesContainer.innerHTML = '';
    
    // recreate pieces from stored shuffle array
    gameState.shuffledPieces.forEach(piece => {
        piecesContainer.appendChild(createPieceElement(piece.image_data, piece.id));
    });

    gameState.boardState = new Array(gameState.gridSize * gameState.gridSize).fill(null);
}

// =============================================================================
// Display functions
// =============================================================================

function createPieceElement(imageData, pieceId) {
    const piece = document.createElement('div');
    piece.className = 'puzzle-piece';
    piece.draggable = true;
    
    piece.dataset.pieceId = pieceId;
    piece.dataset.originalPosition = pieceId;
    piece.dataset.location = 'pile';
    
    const img = document.createElement('img');
    img.src = imageData;
    img.alt = `Piece ${pieceId}`;
    img.style.cssText = 'width:100%;height:100%;display:block';
    img.draggable = false;
    
    piece.appendChild(img);
    piece.addEventListener('dragstart', handleDragStart);
    piece.addEventListener('dragend', handleDragEnd);
    
    return piece;
}

function createGridSlot(row, col) {
    // droppable grids, grid-slot
    const slot = document.createElement('div');
    slot.className = 'grid-slot';
    
    const position = row * gameState.gridSize + col;
    slot.dataset.row = row;
    slot.dataset.col = col;
    slot.dataset.position = position;
    
    // drop zone attributes
    slot.addEventListener('dragover', handleDragOver);
    slot.addEventListener('drop', handleDrop);
    slot.addEventListener('dragleave', handleDragLeave);
    
    return slot;
}

function clearBoard() {
    document.getElementById('puzzle-board').innerHTML = '';
    document.getElementById('pieces-container').innerHTML = '';
    gameState.boardState = [];
}

function setupDragDrop() {
    // after displaying puzzle
    // set up event listeners for drag drop
    const pileContainer = document.getElementById('pieces-container');
    
    pileContainer.addEventListener('dragover', function(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    });
    
    pileContainer.addEventListener('drop', function(e) {
        e.preventDefault();
        if (draggedElement && draggedElement.dataset.location === 'board') {
            // specifically moving piece back to the pile
            pileContainer.appendChild(draggedElement);
            draggedElement.dataset.location = 'pile';
            draggedElement.classList.remove('in-grid');
        }
    });
}

// =============================================================================
// Drag-drop handlers
// =============================================================================

let draggedElement = null;
let draggedFrom = null;

function handleDragStart(e) {
    // storing info of dragged piece
    if (!e.target.classList.contains('puzzle-piece')) {
        e.preventDefault();
        return false;
    }
    
    draggedElement = e.target;
    draggedFrom = e.target.parentElement;
    e.target.classList.add('dragging');
    
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', e.target.dataset.pieceId);
    
    e.stopPropagation();
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
    draggedElement = null;
    draggedFrom = null;
}

function handleDragOver(e) {
    // allow dropping
    if (e.preventDefault) {
        e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'move';
    
    // visual feedback
    if (e.target.classList.contains('grid-slot')) {
        e.target.classList.add('drag-over');
    }
    
    return false;
}

function handleDragLeave(e) {
    if (e.target.classList.contains('grid-slot')) {
        e.target.classList.remove('drag-over');
    }
}

function handleDrop(e) {
    e.stopPropagation();
    e.preventDefault();
    
    if (!draggedElement || !draggedElement.classList.contains('puzzle-piece')) {
        return false;
    }
    
    const slot = e.target.classList.contains('grid-slot') 
        ? e.target 
        : e.target.closest('.grid-slot');
    
    if (slot && draggedElement) {
        slot.classList.remove('drag-over');
        
        const existingPiece = slot.querySelector('.puzzle-piece');
        
        if (existingPiece && draggedFrom) {
            draggedFrom.appendChild(existingPiece);
            existingPiece.dataset.location = draggedFrom.classList.contains('pieces-pile') ? 'pile' : 'board';
            
            if (draggedFrom.classList.contains('pieces-pile')) {
                existingPiece.classList.remove('in-grid');
            }
        }
        
        slot.appendChild(draggedElement);
        draggedElement.dataset.location = 'board';
        draggedElement.classList.add('in-grid');
        
        const position = parseInt(slot.dataset.position);
        const pieceId = parseInt(draggedElement.dataset.pieceId);
        gameState.boardState[position] = pieceId;
    }
    
    return false;
}

// =============================================================================
// Utility Functions
// =============================================================================

function getCurrentPositions() {
    // called when checking solution
    // return array
    // based on current DOM positions
    const positions = [];
    const slots = document.querySelectorAll('.grid-slot');
    
    slots.forEach(slot => {
        const piece = slot.querySelector('.puzzle-piece');
        if (piece) {
            positions.push(parseInt(piece.dataset.pieceId));
        } else {
            positions.push(null);
        }
    });
    return positions;
}


function showMessage(title, text, callback, extraButton, origImage) {
    // modal with buttons
    const modal = document.getElementById('message-modal');
    document.getElementById('message-title').textContent = title;
    document.getElementById('message-text').textContent = text;
    
    // clear and setup buttons
    const buttonContainer = document.getElementById('modal-buttons');
    buttonContainer.innerHTML = '';

    const origContainer = document.getElementById('orig-image-div');
    
    // adds additional buttons if extraButton
    if (extraButton) {
        // first button
        const btn1 = document.createElement('button');
        btn1.className = 'btn btn-primary me-2';
        btn1.textContent = extraButton.text1;
        btn1.onclick = function() {
            bootstrap.Modal.getInstance(modal).hide();
            if (extraButton.callback1) extraButton.callback1();
        };
        buttonContainer.appendChild(btn1);
        
        // second button
        const btn2 = document.createElement('button');
        btn2.className = 'btn btn-secondary';
        btn2.textContent = extraButton.text2;
        btn2.onclick = function() {
            bootstrap.Modal.getInstance(modal).hide();
            if (extraButton.callback2) extraButton.callback2();
        };
        buttonContainer.appendChild(btn2);
    } else {
        // continue button
        const continueBtn = document.createElement('button');
        continueBtn.className = 'btn btn-primary';
        continueBtn.textContent = 'Continue';
        continueBtn.setAttribute('data-bs-dismiss', 'modal');
        continueBtn.onclick = function() {
            if (callback) callback();
        };
        buttonContainer.appendChild(continueBtn);
    }

    origContainer.innerHTML = "";
    if (origImage) {
        const originalImage = document.createElement('img');
        originalImage.src = origImage;
        originalImage.alt = "Original Image";
        origContainer.appendChild(originalImage);
        console.log("origImage src:", origImage);
    }

    
    // show modal
    let bsModal = bootstrap.Modal.getInstance(modal);
    if (!bsModal) {
        bsModal = new bootstrap.Modal(modal);
    }
    bsModal.show();
}

function showGameComplete() {
    // final stage complete
    // click play again or return home
    
    showMessage(
        'Congratulations!', 
        gameState.crazyMode ? 'You beat Crazy Mode!' : 'You won the game!',
        null,
        {
            text1: 'Play Again',
            callback1: () => loadStage(1, gameState.crazyMode),
            text2: 'Back to Home',
            callback2: () => window.location.href = '/'
        }
    );
}