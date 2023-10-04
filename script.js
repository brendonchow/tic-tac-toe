const Board = (() => {
  const state = [["", "", ""], ["", "", ""], ["", "", ""]];

  function clearBoard() {
    for (let i = 0; i < state.length; i++) {
      for (let j = 0; j < state[i].length; j++) {
        state[i][j] = "";
      }
    }
  }

  function updateCell(position, currentTurn) {
    if (state[Math.floor(position / 3)][position % 3] !== "") return;
    state[Math.floor(position / 3)][position % 3] = currentTurn;
  }

  function checkWinner() {
    for (let i = 0; i < 3; i++) {
      if (state[i][0] && state[i][0] === state[i][1] && state[i][1] === state[i][2]) return state[i][0];
    }
    
    for (let i = 0; i < 3; i++) {
      if (state[0][i] && state[0][i] === state[1][i] && state[1][i] === state[2][i]) return state[0][i];
    }

    if (state[1][1] && state[0][0] === state[1][1] && state[1][1] === state[2][2]) return state[1][1];
    if (state[1][1] && state[0][2] === state[1][1] && state[1][1] === state[2][0]) return state[1][1];
  }

  function getActions() {
    const actions = [];
    for (let i = 0; i < state.length; i++) {
      for (let j = 0; j < state[i].length; j++) {
        if (state[i][j] === "") actions.push((i, j));
      }
    }
    return actions;
  }

  function printState() {
    console.log(state)
  }

  return {
    clearBoard,
    updateCell,
    printState,
    checkWinner,
    getActions,
  };
})();

const Player = () => {
  let playAs;
  
  function setPlayAsX() {
    playAs = "X";
  }

  function setPlayAsO() {
    playAs = "O";
  }

  function getPlayAs() {
    return playAs;
  }

  return {
    setPlayAsX,
    setPlayAsO,
    getPlayAs,
  };
};

const Master = (() => {
  const player = Player();
  const computer = Player();

  const boardCells = document.querySelectorAll(".board > button");
  boardCells.forEach(cell => cell.addEventListener("click", _clickCell));

  const playerFirstButton = document.querySelector(".player-first");
  playerFirstButton.addEventListener("click", _setPlayerTurns.bind(playerFirstButton, player, computer));

  const computerFirstButton = document.querySelector(".computer-first");
  computerFirstButton.addEventListener("click", _setPlayerTurns.bind(computerFirstButton, computer, player)); 

  const restartButton = document.querySelector(".restart");
  restartButton.addEventListener("click", _restartBoards);

  const body = document.querySelector("body");
  const dialog = document.querySelector(".dialog-winner");
  dialog.addEventListener("click", () => {
    _restartBoards();
    dialog.close();
    body.classList.remove("blur");
  })  
  const announceWinnerText = document.querySelector(".announce-winner");

  let currentTurn = "X";
  _setPlayerTurns(player, computer);

  function _restartBoards() {
    _restartDisplayBoard();
    Board.clearBoard();
    console.log("Clear board"); 
  }

  function _restartDisplayBoard() {
    boardCells.forEach(button => button.textContent = "");
  }

  function _clickCell(event) {
    const position = event.target.id;
    if (event.target.textContent !== "") return;
    Board.updateCell(position, currentTurn);
    event.target.textContent = currentTurn;
    currentTurn = currentTurn === "X" ? "O" : "X";

    const winner = Board.checkWinner();
    if (winner) {
      announceWinnerText.textContent = `The winner is ${winner} `;
      _openDialog();
    } 
    else if (Board.getActions().length === 0) {
      announceWinnerText.textContent = `It is a draw!`;
      _openDialog();
    } 
  }

  function _openDialog() {
      dialog.showModal();
      body.classList.add("blur");  
      currentTurn = "X";  
  }

  function _setPlayerTurns(firstPlayer, secondPlayer) {
    firstPlayer.setPlayAsX();
    secondPlayer.setPlayAsO();
    _restartBoards();
  }

  function getCurrentTurn() {
    return currentTurn;
  }

  return {
    getCurrentTurn
  }
})();



