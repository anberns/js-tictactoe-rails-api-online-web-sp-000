document.addEventListener('DOMContentLoaded', attachListeners); 

const WINNING_COMBOS = [[0,1,2], [3,4,5], [6,7,8], [0,3,6], [1,4,7], [2,5,8], [0,4,8], [2,4,6]];

let turn = 0;
let gameId = 0;
let gameOver = false;

function player() {
  if (turn % 2 !== 0) {
    return 'O';
  }
  else {
    return 'X';
  }
}

function getCurrentState() {
  let tds = document.getElementsByTagName('td');
  let currentState = []
  for (let td of tds) {
    currentState.push(td.textContent);
  }
  return currentState;
}

function saveCurrentState() {
  let currentState = getCurrentState();
  if (gameId > 0) {
    $.ajax({
      type: 'PATCH',
      url: `/games/${gameId}`,
      data: { state: currentState },
      success: (response) => {
      }
    })
  } else {
    $.ajax({
      type: 'POST',
      url: `/games`,
      data: { state: currentState },
      success: (response) => {
        gameId = response.data.id
        countTurns(response.data.attributes.state)
      }
    });
  }
}

function countTurns(state) {
  let count = 0
  for (let i of state) {
    if (i !== "") {
      count++;
    }
  }
  turn = count + 1;
}

function showPrevious() {
  $.ajax({
    type: 'GET',
    url: `/games`,
    success: (response) => {
      let gamesDiv = document.getElementById('games')
      gamesDiv.innerHTML = "";
      for (let gameObject of response.data) {
        let gameButton = document.createElement('button');
        gameButton.id = gameObject.id;
        gameButton.innerHTML = gameObject.id;
        gameButton.addEventListener("click", () => { loadGame(gameObject) })
        gamesDiv.appendChild(gameButton)
      }
    }
  });
}

function loadGame(game) {
  let count = 0;
  gameId = game.id;
  for (let i = 0; i < 3; ++i) {
    for (let j = 0; j < 3; ++j) {
      $(`[data-x="${j}"][data-y="${i}"]`).html(game.attributes.state[count]);
      count++;
    }
  }

}

function setMessage(message) {
  let messageDiv = document.getElementById('message');
  messageDiv.textContent = message;
}

function checkWinner() {
  let currentState = getCurrentState();  
  for (let i = 0; i < WINNING_COMBOS.length; i++) {
    if (currentState[WINNING_COMBOS[i][0]] !== "" && currentState[WINNING_COMBOS[i][0]] === currentState[WINNING_COMBOS[i][1]] && currentState[WINNING_COMBOS[i][1]] === currentState[WINNING_COMBOS[i][2]]){
      setMessage(`Player ${currentState[WINNING_COMBOS[i][0]]} Won!`)
      return true;
    }
  }
  return false;
}

function attachListeners() {
  loadTable();
  loadButtons();
}

function loadButtons() {
  let clearButton = document.getElementById('clear');
  clearButton.addEventListener("click", clearTable)
  let saveButton = document.getElementById('save');
  saveButton.addEventListener("click", saveCurrentState)
  let showButton = document.getElementById('previous');
  showButton.addEventListener("click", showPrevious)
}

function clearTable() {
  turn = 0;
  gameId = 0;
  gameOver = false;
  let tds = document.getElementsByTagName('td');
  for (let td of tds) {
      td.textContent = "";
  }
  setMessage("");
}

function updateState(target) {
  
  if (target.textContent === "" && !gameOver) {
    target.textContent = player();
    return true;
  } else {
    return false;
  } 
}

function doTurn(el) {
  if (updateState(el)) {
    turn++;
  }

  // check for winner or tie
  if (!checkWinner() && turn === 9) {
    setMessage("Tie game.");
    saveCurrentState();
    clearTable();
  }
  if (checkWinner()) {
    saveCurrentState();
    gameOver = true;
  }
}

function loadTable() {
  let tds = document.getElementsByTagName('td');
  for (let td of tds) {
    td.addEventListener("click", (e) => {
      doTurn(e.target);
    });
  }
}
   


