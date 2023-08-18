// TODO:
// populate scoreboard suggestions based on roll
// automate opponent rounds


// Variables

let gameStart = true;
let roundStart = true;
let nbrRolls = 0;

let nbrGameRounds = 0;

// Constants

const maxRolls = 3;
const maxDiceValue = 6;
const maxGameRounds = 13;
const upperBonusThreshold = 63;
const upperBonus = 35;
const yahtzeeBonus = 100;

// get a random number based on the maximum dice value
const getVal = () => {
  return Math.floor(Math.random() * maxDiceValue) + 1;
};

// *** //
// currently hard-coded for outer board area of 750 x 500
// top/bottom margin 25 / right/left margin 10 for each of 5 column areas
// column rolling areas are 85px; 65px gap between end of one rolling area and beginning of next

// create an array of start/end column positions for 5 columns in the rolling area
const Left = [
  [24, 109],
  [174, 259],
  [324, 409],
  [474, 559],
  [624, 709]
];
const Top = [31, 421];
// *** //

const Rotate = [-45, 45];

// create an array of columns in the rolling area of the screen
const rollColumns = [0, 1, 2, 3, 4];

// create an array of upper scorecard input ids
const upperScorecard = ["ones", "twos", "threes", "fours", "fives", "sixes"];

// create an array of lower scorecard input ids
const lowerScorecard = [
  "threeOfKind",
  "fourOfKind",
  "fullHouse",
  "smStraight",
  "lrgStraight",
  "chance",
  "yahtzee"
];
// create an array of input ids for scoreboard totals
const scoreTotals = ["upper", "bonus", "lower", "total"];

// get a reference to the keep and roll areas on our screen
const Areas = {
  keep: document.querySelector(".keep"),
  roll: document.querySelector(".roll")
};

// Functions

function calcScorecard(which) {
  const score = which.reduce((acc, el) => {
    let val = parseInt(document.querySelector(`#${el}`).value);
    if (!isNaN(val)) return acc + val;
    else return acc + 0;
  }, 0);
  return score;
}

function calcTotal() {
  let bonus = parseInt(document.querySelector("#bonus").value);
  bonus = !isNaN(bonus) ? bonus : 0;
  const total =
    parseInt(document.querySelector("#upper").value) 
    bonus +
    parseInt(document.querySelector("#lower").value);
  document.querySelector("#total").value = total;
}

// gets the index of the start column positions in the Left array based on the number of dice
function getLeftStartCol(nbrDice) {
  // create a startIdx variable with no initial value
  let startIdx;
  // set the startIdx value based on the nbrDice parameter passed into this function
  switch (nbrDice) {
    case 1:
    case 2:
      startIdx = 2;
      break;
    case 3:
    case 4:
      startIdx = 1;
      break;
    case 5:
      startIdx = 0;
      break;
  }
  // return the startIdx value to the calling function
  return startIdx;
}

function rollDice() {
  // we're incrementing the number of rolls, which defaults to zero at the beginning of the game
  nbrRolls++;
  // we're checking to see if it's the start of a round; if so, we set cls to keep; otherwise, we set it to roll
  const cls = roundStart ? ".keep" : ".roll";
  // we're toggling the roundStart variable back to a false value
  if (roundStart) roundStart = false;
  // we're creating an array of all dice images inside the keep class area if this is the round start
  // or the roll class area if we've already rolled once
  // the `${}` syntax is a variable value parsed to a string inside a template literal
  const dice = Array.from(
    document.querySelector(`${cls}`).getElementsByTagName("IMG")
  );
  // we call the getLeftStartCol function to set the rolling area column array's start index based on the number of dice
  let idx = getLeftStartCol(dice.length);

  // we're looping over the dice image array we just created
  dice.forEach(el => {
    // get the value of the die
    const val = getVal();
    // get the image associated with the value
    el.src = `img/die${val}.png`;
    // change the image class name to dice-abs
    el.classList.add("dice-abs");
    // setting a data-val attribute to the value
    el.setAttribute("data-val", `${val}`);
    // setting a data-col attribute to the start index
    el.setAttribute("data-col", `${idx}`);
    // sets the style attribute to position and rotate the die randomly
    el.style = `
    left:${getRandomNbr(Left[idx][0], Left[idx][1])}px;
    top:${getRandomNbr(Top[0], Top[1])}px;
    transform:rotate(${getRandomNbr(Rotate[0], Rotate[1])}deg) scale(1,1)`;
    // if it's the start of a game, we add an event listener that triggers the moveToKeepOrRoll function 
    // when this die is clicked
    if (gameStart) {
      el.addEventListener("click", moveToKeepOrRoll);
      //el.addEventListener("mouseover", getPosition); // testing only
    }
    // add the die to the roll area of the screen
    Areas.roll.appendChild(el);
    // increment the index by 1
    idx++;
  });
  
  // toggle the gameStart variable to false if it's true
  if (gameStart) gameStart = false;

  // disable the "Roll Dice" button if we've rolled the maximum number of times
  if (nbrRolls === maxRolls) {
    document.querySelector(".btn").disabled = true;
  }
}

function getPosition(e) {
  console.log(e.target.getBoundingClientRect());
}

function getRandomNbr(min, max) {
  return Math.random() * (max - min) + min; // max is exclusive and min is inclusive
}

function getOpenCols(cols) {
  const result = rollColumns.filter(function(n) {
    return !this.has(n);
  }, new Set(cols));
  return result;
}

function moveToKeepOrRoll(e) {
  // get the class name of the die that triggered this function
  const parentClass = e.target.parentNode.className;
  // if the class name is keep...
  if (parentClass === "keep") {
    // create an array of images in the rolling area with a dice class name
    const dice = Array.from(Areas.roll.getElementsByClassName("dice"));
    // initialize an empty cols array
    let cols = [];
    // populate the cols array with the value of each data-col attribute in the dice array
    dice.forEach(el => {
      cols.push(parseInt(el.dataset.col));
    });
    // sort the cols array
    cols.sort();

    const open = getOpenCols(cols);
    const idx = open[0];
    e.target.setAttribute("data-col", `${idx}`);
    e.target.classList.add("dice-abs");
    e.target.style = `left:${getRandomNbr(
      Left[idx][0],
      Left[idx][1]
    )}px;top:${getRandomNbr(Top[0], Top[1])}px;transform:rotate(${getRandomNbr(
      Rotate[0],
      Rotate[1]
    )}deg) scale(1,1)`;
    Areas.roll.appendChild(e.target);
  // otherwise, call the moveToSaved function
  } else {
    moveToSaved(e.target);
  }
}

function moveToSaved(el) {
  el.classList.remove("dice-abs");
  el.style = "";
  Areas.keep.appendChild(el);
}

function calcScore(dice) {
  return dice.reduce((acc, el) => {
    let val = parseInt(el.dataset.val);
    return !isNaN(val) ? acc + parseInt(el.dataset.val) : 0;
  }, 0);
}

// if joker (more than one yahtzee), must use upper score for die values if not already scored
// else joker good for any lower score
function calcYahtzeeScore(val) {
  if (val >= 50) {
    return (val += 100);
  } else {
    return 50;
  }
}

function isNOfKind(dice, n) {
  const vals = dice.map(el => parseInt(el.dataset.val));
  const result = vals.reduce(
    (a, c) => ((a[c] = (a[c] || 0) + 1), a),
    Object.create(null)
  );
  for (let key in result) {
    if (result[key] === n) {
      return true;
    }
  }
  return false;
}

function hasNConsecutiveValues(dice, n) {
  const vals = dice.map(el => parseInt(el.dataset.val));
  vals.sort();
  let consecutive = 1;
  for (let i = 0; i < vals.length; i++) {
    if (i > 0) if (vals[i] === vals[i - 1] + 1) consecutive++;
    if (consecutive === n) return true;
  }
  return false;
}

function resetRound(rolledDice) {
  rolledDice.forEach(el => {
    moveToSaved(el);
  });
  document.querySelector(".btn").disabled = false;
  nbrRolls = 0;
}


function addScore(e) {
  let score;
  const savedDice = Array.from(Areas.keep.getElementsByTagName("IMG"));
  const rolledDice = Array.from(Areas.roll.getElementsByTagName("IMG"));
  const dice = savedDice.concat(rolledDice);
  let hasJoker =
    isNOfKind(dice, 5) &&
    parseInt(document.querySelector("#yahtzee").value) >= 50;
  let val = upperScorecard.indexOf(e.target.id);
  if (val === -1) {
    switch (e.target.id) {
      case "threeOfKind":
        e.target.value =
          isNOfKind(dice, 3) || isNOfKind(dice, 4) || hasJoker
            ? calcScore(dice)
            : 0;
        break;
      case "fourOfKind":
        e.target.value = isNOfKind(dice, 4) || hasJoker ? calcScore(dice) : 0;
        break;
      case "chance":
        e.target.value = calcScore(dice);
        break;
      case "fullHouse":
        e.target.value =
          (isNOfKind(dice, 3) && isNOfKind(dice, 2)) || hasJoker ? 25 : 0;
        break;
      case "smStraight":
        e.target.value = hasNConsecutiveValues(dice, 4) || hasJoker ? 30 : 0;
        break;
      case "lrgStraight":
        e.target.value = hasNConsecutiveValues(dice, 5) || hasJoker ? 40 : 0;
        break;
      case "yahtzee":
        e.target.value = isNOfKind(dice, 5)
          ? calcYahtzeeScore(parseInt(e.target.value))
          : 0;
        break;
    }
    document.querySelector("#lower").value = calcScorecard(lowerScorecard);
  } else {
    val = val + 1;
    let diceToSum = dice.filter(el => parseInt(el.dataset.val) === val);
    score = diceToSum.reduce((acc, el) => {
      return acc + parseInt(el.dataset.val);
    }, 0);
    e.target.value = score;
    const upperScore = calcScorecard(upperScorecard);
    document.querySelector("#upper").value = upperScore;
    document.querySelector("#bonus").value =
      upperScore >= upperBonusThreshold ? upperBonus : 0;
  }
  if (hasJoker) {
    const y = document.querySelector("#yahtzee");
    y.value = parseInt(y.value) + 100;
  }
  e.target.disabled = true;
  resetRound(rolledDice);
  roundStart = true;
  nbrGameRounds++;
  if (nbrGameRounds === maxGameRounds) {
    calcTotal();
    document.querySelector(".btn").style.display = "none";
    document.querySelector(".new").style.display = "";
  }
}

function resetScoreboard() {
  const scoreInputs = upperScorecard.concat(lowerScorecard).concat(scoreTotals);
  scoreInputs.forEach(el => {
    const n = document.querySelector(`#${el}`);
    n.value = "";
    n.disabled = false;
  });
  document.querySelector(".btn").style.display = "";
  document.querySelector(".new").style.display = "none";
  nbrGameRounds = 0;
  gameStart = true;
}

//  Event Listeners
document.querySelector(".btn").addEventListener("click", rollDice);
document.querySelector(".new").addEventListener("click", resetScoreboard);
Array.from(document.querySelectorAll(".score")).forEach(el =>
  el.addEventListener("click", addScore)
);
