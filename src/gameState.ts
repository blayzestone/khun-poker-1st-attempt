import { Action, Card, State } from "./constants";
import { GameTree, GameTreeNode, TerminalNode } from "./gameTree";
import { Player, PlayerCards } from "./player";
import {
  awardCrown,
  flipCardsFaceUp,
  foldCard,
  resetGameEffects,
  updateActionMessage,
  updateCards,
  updatePlayerChips,
  updatePot,
} from "./ui";

export class GameState {
  state: State;

  p1: Player;
  p2: Player;
  turnPlayer: Player;
  cards: PlayerCards;

  root: GameTreeNode;
  current: GameTreeNode;

  constructor() {
    this.p1 = new Player("player1");
    this.p2 = new Player("player2");

    this.turnPlayer = this.p1;

    this.cards = this.dealCards();

    const gameTree = new GameTree(2);

    this.root = gameTree.root;
    this.current = this.root;

    this.state = State.Init;
  }

  loop() {
    switch (this.state) {
      case State.SetupGame:
        this.startGame();
        break;
      case State.PlayGame:
        this.playGame();
        break;
      case State.ResetGame:
        this.resetGame();
        break;
    }
  }

  startGame() {
    this.cards = this.dealCards();

    // Each player antes 1
    this.bet(this.p1);
    this.bet(this.p2);

    updatePot(2);

    this.current = this.root;
    this.turnPlayer = this.p1;

    this.state = State.PlayGame;
  }

  playGame() {
    if (this.current instanceof TerminalNode) {
      if (
        this.current.lastAction === Action.Call ||
        this.current.lastAction === Action.Check
      ) {
        const winner = this.showdown(this.p1, this.p2);
        this.awardWiner(winner, this.current.pot);
      } else if (this.current.lastAction === Action.Fold) {
        if (this.turnPlayer.id === this.p1.id) {
          foldCard(this.p2);
        } else {
          foldCard(this.p1);
        }
        this.awardWiner(this.turnPlayer, this.current.pot);
      }

      this.state = State.ResetGame;
      return;
    }

    const action = this.turnPlayer.getAction(this.current.availableActions());
    const nextNode = this.current.children[action];
    if (!nextNode) {
      throw new Error(`No node available for action: ${action}`);
    }
    updateActionMessage(this.turnPlayer, action);

    if (action === Action.Bet || action === Action.Call) {
      this.bet(this.turnPlayer);
    }

    updatePot(nextNode.pot);
    this.toggleTurnPlayer();
    this.current = nextNode;
  }

  toggleTurnPlayer() {
    if (!this.turnPlayer) return;

    if (this.turnPlayer.id === this.p1.id) {
      this.turnPlayer = this.p2;
    } else {
      this.turnPlayer = this.p1;
    }
  }

  resetGame() {
    resetGameEffects();
    this.p1.bet = 0;
    this.p2.bet = 0;

    this.state = State.SetupGame;
  }

  resetAll() {
    resetGameEffects();

    this.p1 = new Player("player1");
    this.p2 = new Player("player2");

    this.turnPlayer = this.p1;

    updatePlayerChips(this.p1);
    updatePlayerChips(this.p2);

    const gameTree = new GameTree(2);

    this.root = gameTree.root;
    this.current = this.root;

    this.state = State.Init;
  }

  // showdown between both player's cards. The player with the higher rank
  // wins and is returned.
  showdown(p1: Player, p2: Player): Player {
    flipCardsFaceUp();
    const p1Card = this.cards[this.p1.id];
    const p2Card = this.cards[this.p2.id];
    if (p1Card > p2Card) {
      return p1;
    } else {
      return p2;
    }
  }

  awardWiner(winner: Player, pot: number) {
    winner.chips += pot;
    updatePlayerChips(winner);
    awardCrown(winner);
  }

  dealCards(): PlayerCards {
    const deck = [Card.Jack, Card.Queen, Card.King];
    const cards: PlayerCards = {
      player1: deck.splice(Math.floor(Math.random() * deck.length), 1)[0],
      player2: deck.splice(Math.floor(Math.random() * deck.length), 1)[0],
    };
    updateCards(cards);
    return cards;
  }

  bet(player: Player) {
    player.bet++;
    player.chips--;
    updatePlayerChips(player);
  }
}
