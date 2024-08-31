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
  playGame: (current: GameTreeNode, p1: Player, p2: Player) => void;
  showdown: (p1: Player, p2: Player) => Player;
  dealCards: () => [Card, Card];
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
        console.log("Playing game", this.gameTree.root);
        this.playGame(this.gameTree.root, this.p1, this.p2);
        this.state = State.Init;
        break;
    }
  },

  startGame() {
    console.log("Starting game");

    const [card1, card2] = this.dealCards();

    this.p1.card = card1;
    this.p2.card = card2;

    // Each player antes 1
    this.p1.bet++;
    this.p2.bet++;

    this.gameTree = new GameTree(2);

    this.state = State.PlayGame;
  },

  playGame(current: GameTreeNode, p1: Player, p2: Player) {
    if (!this.gameTree) return;

    if (current instanceof TerminalNode) {
      if (
        current.lastAction === Action.Call ||
        current.lastAction === Action.Check
      ) {
        console.log(`P1: ${Card[p1.card]} VS P2: ${Card[p2.card]}`);
        const winner = this.showdown(p1, p2);
        console.log(`${winner.id} wins`);
        winner.chips += current.pot;
      } else if (current.lastAction === Action.Fold) {
        p1.chips += current.pot;
      }

      this.state = State.Init;
      return;
    }

    const action = p1.getAction(current.availableActions());
    const nextNode = current.children[action];
    if (!nextNode) {
      throw new Error(`No node available for action: ${action}`);
    }
    console.log(p1.id, action);

    if (Action.Bet || Action.Call) {
      p1.bet++;
    }

    this.playGame(nextNode, p2, p1);
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
};
