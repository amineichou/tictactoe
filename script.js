//############################################################################################//
//--------------------------------------------------------------------------------------------//
//------------------------ by amine ichou ------------- 12 oct 2022 --------------------------//
//--------------------------------------------------------------------------------------------//
//-------------------------------- Tic Tac Toe in JavaScript ---------------------------------//
//--------------------------------------------------------------------------------------------//
//---------- # i wrote this code by learning and following a freeCodeCamp tutorial # ---------//
//--------------------------------------------------------------------------------------------//
//############################################################################################//

// to keep tracking the plays of the two players (human & ai)
var Table;
// human player
const humanPlayer = 'O';
// Ai player
const robotPlayer = 'X';

const winCombos = [
    // all possible winning combinations 
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [6, 4, 2]
];


// i just added some audios for fun when you win, lose or in case of a tie
var loseAudio = new Audio('./audios/lose.mp3');
var winAudio = new Audio('./audios/win.mp3');
var tieAudio = new Audio('./audios/tie.mp3');


const cells = document.querySelectorAll('.cell');


// set the score to 0 when runing the app for the first time
const setScore = () => {
    if (localStorage.length == 0) {
        localStorage.setItem('human', 0); 
        localStorage.setItem('robot', 0);
    }
}
setScore();

const startGame = () => {
    // this function starts a new game 
    document.querySelector(".endgame").style.display = "none";
    // make the Table array like this : [1,2,3,4,5,6,7,8]
    Table = Array.from(Array(9).keys());

    // starting a new game by empting the cells, backgroundColor and adding a click event listener
    for (var i = 0; i < cells.length; i++) {
        cells[i].innerHTML = '';
        cells[i].style.removeProperty('background-color');
        cells[i].addEventListener('click', turnClick, false);
    }
}

const declareWinner = (winner) => {
    document.querySelector('.endgame').style.display = 'flex';
    document.querySelector('.endgame .endgame-text').innerText = winner;
}

const turnClick = (square) => {
    if (typeof Table[square.target.id] == 'number') {
        turn(square.target.id, humanPlayer);
        if (!checkTie() && !checkWin(Table, humanPlayer)) {
            // check if there's empty cells so we can stop down the game (stop the ai player)
            // robotNextMove function won't work if there's no more empty cells
            // that's why we made the checkTie function to check for empty cells
            turn(robotNextMove(), robotPlayer)
        }
    }
}

const checkTie = () => {
    // this function checks if there's empty cells
    if (emptySquares().length == 0 && !checkWin(Table, humanPlayer)) {
        for (var i = 0; i < cells.length; i++) {
            // turn the cells background color to blue because no one win the game
            cells[i].style.backgroundColor = '#0000ff50';
            // removing the event listener so you can't click (play the game) anymore after the game over
            cells[i].removeEventListener('click', turnClick, false);
            // play tie audio
            tieAudio.play();
        }
        declareWinner('Almost!');
        return true;
    }
    return false;
}

const turn = (squareId, player) => {
    // keep tracking the plays and check for win
    Table[squareId] = player;
    cells[squareId].innerHTML = player;
    let gameWon = checkWin(Table, player);
    if (gameWon) {
       gameOver(gameWon); 
    }
}

const checkWin = (table, player) => {
    // this function checks if there's a winner by comparing the players plays with the winning combination array 'winCombos'
    let plays = table.reduce((a, e, i) =>
        (e === player) ? a.concat(i) : a, []);
    let gameWon = null;
    for (let [index, win] of winCombos.entries()) {
        if (win.every(elem => plays.indexOf(elem) > -1)) {
            gameWon = { index: index, player: player };
            break;
        }
    }
    return gameWon;
}


const gameOver = (gameWon) => {
    // this function runs when gameWon (when a player won)
    for (let index of winCombos[gameWon.index]) {
        // turn the cells background color to green if the human player won or the to red when the robot won
        document.getElementById(index).style.backgroundColor = gameWon.player == humanPlayer ? '#00800050' : '#ff000050';
    }
    for (var i = 0; i < cells.length; i++) {
        // removing the event listener so you can't click (play the game) anymore after the game over
        cells[i].removeEventListener('click', turnClick, false);
    }
    declareWinner(gameWon.player == humanPlayer ? 'You win!' : 'You lose!');
    // play audio => win or lose
    gameWon.player == humanPlayer ? winAudio.play() : loseAudio.play();

    // add to the score
    (gameWon.player == humanPlayer) ? (localStorage.setItem('human', parseInt(localStorage.getItem('human')) + 1)) : (localStorage.setItem('robot', parseInt(localStorage.getItem('robot')) + 1));
    // update score on the page
    updateScore();
}

const updateScore = () => {
    // this function will update the score on the page
    document.querySelector(".score .human").innerText = `You : ${localStorage.getItem('human')}`;
    document.querySelector(".score .robot").innerText = `Robot : ${localStorage.getItem('robot')}`;
}
updateScore();


const clearScore = () => {
    // clear the score by making it eq. to 0
    localStorage.setItem('human', 0);
    localStorage.setItem('robot', 0);
    // update score on the page
    updateScore();
}

// ai player
// we are using the Minimax algorithm
function minimax(newTable, player) {
    var availSpots = emptySquares();

    if (checkWin(newTable, humanPlayer)) {
        return { score: -10 };
    } else if (checkWin(newTable, robotPlayer)) {
        return { score: 10 };
    } else if (availSpots.length === 0) {
        return { score: 0 };
    }
    var moves = [];
    for (var i = 0; i < availSpots.length; i++) {
        var move = {};
        move.index = newTable[availSpots[i]];
        newTable[availSpots[i]] = player;

        if (player == robotPlayer) {
            var result = minimax(newTable, humanPlayer);
            move.score = result.score;
        } else {
            var result = minimax(newTable, robotPlayer);
            move.score = result.score;
        }

        newTable[availSpots[i]] = move.index;

        moves.push(move);
    }

    var bestMove;
    if (player === robotPlayer) {
        var bestScore = -10000;
        for (var i = 0; i < moves.length; i++) {
            if (moves[i].score > bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    } else {
        var bestScore = 10000;
        for (var i = 0; i < moves.length; i++) {
            if (moves[i].score < bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    }

    return moves[bestMove];
}


const emptySquares = () => {
    return Table.filter(s => typeof s == 'number');
}

const robotNextMove = () => {
    // this function will find the best spot (cell) for the ai player to play using the minimax algorithm
    return minimax(Table, robotPlayer).index;
}

// to start the game
startGame()