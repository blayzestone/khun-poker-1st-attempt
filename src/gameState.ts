import { Action, Card, State } from "./constants";
import { GameTree, GameTreeNode, TerminalNode } from "./gameTree";
import { Player } from "./player";

type GameState = {
  state: State;

  p1: Player;
  p2: Player;

  gameTree: GameTree | null;

  loop: () => void;
  startGame: () => void;
  playGame: (current: GameTreeNode, turnPlayer: Player) => void;
  reset: () => void;
  showdown: (p1: Player, p2: Player) => Player;
  dealCards: () => [Card, Card];
  bet: (player: Player) => void;
};

export const gameState: GameState = {
  state: State.SetupGame,
  gameTree: null,

  p1: new Player("player1", Card.Jack),
  p2: new Player("player2", Card.Jack),

  loop() {
    switch (this.state) {
      case State.SetupGame:
        this.startGame();
        break;
      case State.PlayGame:
        if (!this.gameTree) return;
        console.log(`P1: ${this.p1.chips}bb | ${this.p1.bet} bet`);
        console.log(`P2: ${this.p2.chips}bb | ${this.p2.bet} bet`);
        this.playGame(this.gameTree.root, this.p1);
        console.log(`P1: ${this.p1.chips}bb | ${this.p1.bet} bet`);
        console.log(`P2: ${this.p2.chips}bb | ${this.p2.bet} bet`);
        break;
      case State.ResetGame:
        this.reset();
        break;
    }
  },

  startGame() {
    console.log("Starting game");

    const [card1, card2] = this.dealCards();

    this.p1.card = card1;
    this.p2.card = card2;

    // Each player antes 1
    this.bet(this.p1);
    this.bet(this.p2);

    this.gameTree = new GameTree(2);

    this.state = State.PlayGame;
  },

  playGame(current: GameTreeNode, turnPlayer: Player) {
    if (!this.gameTree) return;
    if (current instanceof TerminalNode) {
      if (
        current.lastAction === Action.Call ||
        current.lastAction === Action.Check
      ) {
        console.log(`P1: ${Card[this.p1.card]} VS P2: ${Card[this.p2.card]}`);
        const winner = this.showdown(this.p1, this.p2);
        console.log(`${winner.id} wins`);
        winner.chips += current.pot;
      } else if (current.lastAction === Action.Fold) {
        turnPlayer.chips += current.pot;
      }

      this.state = State.ResetGame;
      return;
    }

    const action = turnPlayer.getAction(current.availableActions());
    const nextNode = current.children[action];
    if (!nextNode) {
      throw new Error(`No node available for action: ${action}`);
    }
    console.log(turnPlayer.id, action);

    if (action === Action.Bet || action === Action.Call) {
      this.bet(turnPlayer);
    }

    if (turnPlayer.id === this.p1.id) {
      this.playGame(nextNode, this.p2);
    } else {
      this.playGame(nextNode, this.p1);
    }
  },

  reset() {
    this.p1.bet = 0;
    this.p2.bet = 0;

    this.state = State.Init;
  },

  // showdown between both player's cards. The player with the higher rank
  // wins and is returned.
  showdown(p1: Player, p2: Player): Player {
    if (p1.card > p2.card) {
      return p1;
    } else {
      return p2;
    }
  },

  dealCards(): [Card, Card] {
    const deck = [Card.Jack, Card.Queen, Card.King];

    const card1 = deck.splice(Math.floor(Math.random() * deck.length), 1)[0];
    const card2 = deck.splice(Math.floor(Math.random() * deck.length), 1)[0];

    return [card1, card2];
  },

  bet(player: Player) {
    player.bet++;
    player.chips--;
  },
};
