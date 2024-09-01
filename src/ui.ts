import { Player } from "./player";

export function updatePot(value: number) {
  const pot = document.querySelector(".pot");
  if (pot) pot.textContent = `Pot: ${value}bb`;
}

export function updatePlayerChips(player: Player) {
  const chips = document.querySelector(`#${player.id} .chips`);
  if (chips) chips.textContent = `${player.chips}`;
}
