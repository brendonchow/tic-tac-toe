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

const Ai = () => {

  function playAI(board, playAs) {
    const actions = board.getActions();
    if (playAs === "X") {
      let max = [-1, actions[0], 100];
      for (const action of actions) {
        const [result, depth] = _minimizeAI(board.updateCellAI(action[0], action[1], "X"), max[0]);
        if (result === 1 && max[0] === 1) {
          max = depth >= max[2] ? max : [result, action, depth];
        } else max = max[0] >= result ? max : [result, action, depth];
      }
      return max[1];
    } else {
      let min = [1, actions[0], 100];
      for (const action of actions) {
        const [result, depth] = _maximizeAI(board.updateCellAI(action[0], action[1], "O"), min[0]);
        if (result === -1 && min[0] === -1) {
          max = depth >= min[2] ? min : [result, action, depth];
        } else min = min[0] <= result ? min : [result, action, depth];
      }
      return min[1];
    }
  }

  function _minimizeAI(board, prev) {
    const boardWinner = board.checkWinner();
    if (boardWinner === "X") return [1, 1];
     else if (boardWinner === "O") return [-1, 1];

    const actions = board.getActions();
    if (actions.length === 0) return [0, 1];

    let min = [1];
    for (const action of actions) {
      const [result, depth] = _maximizeAI(board.updateCellAI(action[0], action[1], "O"), min[0]);
      if (result <= prev) return [result, depth + 1];
      if (min.length === 1) min = [result, depth];
      else min = min[0] <= result ? min : [result, depth]; 
    }
    return [min[0], min[1] + 1];
  }

  function _maximizeAI(board, prev) {
    const boardWinner = board.checkWinner();
    if (boardWinner === "X") return [1, 1] ;
    else if (boardWinner === "O") return [-1, 1];

    const actions = board.getActions();
    if (actions.length === 0) return [0, 1];

    let max = [-1];
    for (const action of actions) {
      const [result, depth] = _minimizeAI(board.updateCellAI(action[0], action[1], "X"), max[0]);
      if (result >= prev) return [result, depth + 1];
      if (max.length === 1) max = [result, depth];
      else max = max[0] >= result ? max : [result, depth];
    }
    return [max[0], max[1] + 1];
  } 

  return Object.assign({}, Player(), {
    playAI,
  })
}

const DisplayController = (() => {
  const player = Player();
  const computer = Ai();
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

  function getCellGivenID(id) {
    for (const cell of boardCells) {
      if (Number(cell.id) === id) {
        return cell;
      }
    }
  }

  function _makeAIMove() {
    const aiMove = computer.playAI(board, currentTurn);
    makeMove(aiMove[0], aiMove[1], getCellGivenID(aiMove[0] * 3 + aiMove[1]));
  }
  return {}
})();



