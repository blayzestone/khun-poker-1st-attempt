import { Card, State } from "./constants";
import { GameState } from "./gameState";
import { Player, PlayerCards } from "./player";

export function setupNavButtons(gameState: GameState) {
  const nav = document.querySelector(".nav");
  if (nav) {
    for (const el of nav.children) {
      if (el.classList.contains("play")) {
        el.addEventListener("click", () => {
          gameState.state = State.SetupGame;
        });
      }
    }
  }
}

export function updatePot(value: number) {
  const pot = document.querySelector(".pot");
  if (pot) pot.textContent = `Pot: ${value}bb`;
}

export function updatePlayerChips(player: Player) {
  const chips = document.querySelector(`#${player.id} .chips`);
  if (chips) chips.textContent = `${player.chips}`;
}

export function resetGameEffects() {
  const cards = document.querySelectorAll(`.card-holder`);
  for (const card of cards) {
    card.classList.remove("flip");
    card.classList.remove("muck");

    const c = card.querySelector(".card");
    if (c) {
      c.classList.remove("king");
      c.classList.remove("queen");
      c.classList.remove("jack");
    }
  }

  const crown = document.querySelector(`.crown`);
  if (crown) crown.classList.remove(`player1-win`);
  if (crown) crown.classList.remove(`player2-win`);
}

export function updateCards(cards: PlayerCards) {
  const p1Card = document.querySelector(`#player1 .card-holder .card`);
  const p2Card = document.querySelector(`#player2 .card-holder .card`);

  if (p1Card) {
    p1Card.classList.add(`${Card[cards.player1].toLowerCase()}`);
  }
  if (p2Card) {
    p2Card.classList.add(`${Card[cards.player2].toLowerCase()}`);
  }
}

export function flipCardsFaceUp() {
  const cards = document.querySelectorAll(`.card-holder`);
  for (const card of cards) {
    card.classList.add("flip");
  }
}

export function foldCard(player: Player) {
  const card = document.querySelector(`#${player.id} .card-holder`);
  if (card) card.classList.add("muck");
}

export function updateActionMessage(player: Player, message: string) {
  const actionMessage = document.createElement("div");
  actionMessage.classList.add("action");
  actionMessage.textContent = message;

  const playerHud = document.querySelector(`#${player.id} .hud`);
  if (playerHud) {
    playerHud.appendChild(actionMessage);

    setTimeout(() => {
      playerHud.removeChild(actionMessage);
    }, 2000);
  }
}

export function awardCrown(player: Player) {
  const crown = document.querySelector(`.crown`);
  if (crown) crown.classList.add(`${player.id}-win`);
}
