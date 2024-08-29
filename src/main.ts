import { gameState } from "./gameState";
import "./style.css";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <h1>Hello World</h1>
`;

function init() {
  function start() {
    gameState.loop();

    requestAnimationFrame(start);
  }

  requestAnimationFrame(start);
}

init();

/* 
  GAME LOOP
  1. INIT
    - Each player antes 1 chip.
    - Cards are dealt
  2. Player #1 action
    - Check
    - Bet  
  
  3a. Player #2 action (Player #1 checked)
    - Check
    - Bet

  3b. Player #2 action (Player #1 bet)
    - Call
    - Fold

  4. Player #1 action (Player #2 bet)
    - Call
    - Fold

  5. Showdown
    - Winner gets the pot

  NOTES
  Game loop can be simplified:
  1. Init
  2. Player #1 action
  3. Player #2 action
  4. Showdown

  The options available to each player during their action can be determined
  by tracking what actions have already been taken by either player. 
*/
