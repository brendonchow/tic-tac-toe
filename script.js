const Board = initialState => {
  // Deep copy initial state if initial state is given.
  const state = initialState 
                ? JSON.parse(JSON.stringify(initialState)) 
                : [["", "", ""], ["", "", ""], ["", "", ""]];

  function clearBoard() {
    for (let i = 0; i < state.length; i++) {
      for (let j = 0; j < state[i].length; j++) {
        state[i][j] = "";
      }
    }
  }

  function updateCell(row, col, playAs) {
    if (state[row][col] !== "") return;
    state[row][col] = playAs;
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
        if (state[i][j] === "") actions.push([i, j]);
      }
    }
    return actions;
  }

  function getState() {
    return JSON.parse(JSON.stringify(state));
  }

  function copyBoard() {
    return Board(JSON.parse(JSON.stringify(state)));
  }

  function updateCellAI(row, col, playAs) {
    const newBoard = copyBoard();
    newBoard.updateCell(row, col, playAs);
    return newBoard;
  }

  return {
    clearBoard,
    updateCell,
    copyBoard,
    checkWinner,
    getActions,
    getState,
    updateCellAI,
  };
};

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

const DisplayController = (() => {
  const player = Player();
  const computer = Player();
  const board = Board();

  const boardCells = document.querySelectorAll(".board > button");
  boardCells.forEach(cell => cell.addEventListener("click", _clickCell));

  const playerFirstButton = document.querySelector(".player-first");
  playerFirstButton.addEventListener("click", () => {
    _setPlayerTurns(player, computer);
    playerFirstButton.classList.add("active");
    computerFirstButton.classList.remove("active");
  });

  const computerFirstButton = document.querySelector(".computer-first");
  computerFirstButton.addEventListener("click", () => {
    _setPlayerTurns(computer, player);
    playerFirstButton.classList.remove("active");
    computerFirstButton.classList.add("active");
  }); 

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
  let aiPlay = true;

  function _restartBoards() {
    _restartDisplayBoard();
    board.clearBoard();
    currentTurn = "X";
    if (computer.getPlayAs() === currentTurn) {
      _makeComputerFirstMove();
    }
  }

  function _makeComputerFirstMove() {
    const actions = [[0, 0], [2, 0], [1, 1], [0, 2], [2, 2]];
    const action = actions[Math.floor(Math.random() * actions.length)];
    makeMove(action[0], action[1], getCellGivenID(action[0] * 3 + action[1]));
  }

  function _restartDisplayBoard() {
    boardCells.forEach(button => button.textContent = "");
  }

  function _openDialog() {
      dialog.showModal();
      body.classList.add("blur");   
  }

  function _setPlayerTurns(firstPlayer, secondPlayer) {
    firstPlayer.setPlayAsX();
    secondPlayer.setPlayAsO();
    _restartBoards();
  }

  function getCurrentTurn() {
    return currentTurn;
  }

  function _clickCell(event) {
    if (event.target.textContent !== "") return;
    const row = Math.floor(event.target.id / 3);
    const col = event.target.id % 3;
    makeMove(row, col, event.target);
  }

  function makeMove(row, col, correspondingCell) {
    correspondingCell.textContent = currentTurn;
    board.updateCell(row, col, currentTurn);
    
    const winner = board.checkWinner();
    if (winner) {
      announceWinnerText.textContent = `The winner is ${winner} `;
      _openDialog();
      return;
    } else if (board.getActions().length === 0) {
      announceWinnerText.textContent = `It is a draw!`;
      _openDialog();
      return;
    } 

    currentTurn = currentTurn === "X" ? "O" : "X";
    if (aiPlay && computer.getPlayAs() === currentTurn) {
      _makeAIMove();
    }
  }

  function _makeAIMove() {
    const aiMove = _playAI(board, currentTurn, currentTurn === "X" ? 1 : -1);
    makeMove(aiMove[1][0], aiMove[1][1], getCellGivenID(aiMove[1][0] * 3 + aiMove[1][1]));
  }

  function getCellGivenID(id) {
    for (const cell of boardCells) {
      if (Number(cell.id) === id) {
        return cell;
      }
    }
  }

  function _playAI(board, playAs, prev) {
    const boardWinner = board.checkWinner();
    if (boardWinner === "X") {
      return [1];
    } else if (boardWinner === "O") {
      return [-1];
    }

    const actions = board.getActions();
    if (actions.length === 0) {
      return [0];
    } else if (playAs === "X") {
      let max = [-1, actions[0]];
      for (const action of actions) {
        const [result, _] = _playAI(board.updateCellAI(action[0], action[1], "X"), "O", max[0]);
        if (result === 1) return [1, action];
        if (result >= prev) return [result, action];
        max = max[0] >= result ? max : [result, action];
      }
      return max;
    } else {
      let min = [1, actions[0]];
      for (const action of actions) {
        const [result, _] = _playAI(board.updateCellAI(action[0], action[1], "O"), "X", min[0]);
        if (result === -1) return [-1, action];
        if (result <= prev) return [result, action];
        min = min[0] <=  result ? min : [result, action];
      }
      return min;
    }
  }

  return {
    getCurrentTurn
  }
})();



