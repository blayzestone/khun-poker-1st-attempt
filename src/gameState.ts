import { Action, Card, State } from "./constants";
import { GameTree, GameTreeNode, TerminalNode } from "./gameTree";
import { Player } from "./player";

type GameState = {
  state: State;

  p1: Player;
  p2: Player;
  turnPlayer: Player | null;

  gameTree: GameTree | null;
  current: GameTreeNode | null;

  loop: () => void;
  startGame: () => void;
  playGame: () => void;
  reset: () => void;
  showdown: (p1: Player, p2: Player) => Player;
  dealCards: () => [Card, Card];
  bet: (player: Player) => void;
  toggleTurnPlayer: () => void;
};

export const gameState: GameState = {
  state: State.SetupGame,
  gameTree: null,
  current: null,

  p1: new Player("player1", Card.Jack),
  p2: new Player("player2", Card.Jack),
  turnPlayer: null,

  loop() {
    switch (this.state) {
      case State.SetupGame:
        this.startGame();
        break;
      case State.PlayGame:
        this.playGame();
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
    this.current = this.gameTree.root;
    this.turnPlayer = this.p1;

    this.state = State.PlayGame;
  },

  playGame() {
    if (!this.gameTree) return;
    if (!this.current) return;
    if (!this.turnPlayer) return;

    if (this.current instanceof TerminalNode) {
      if (
        this.current.lastAction === Action.Call ||
        this.current.lastAction === Action.Check
      ) {
        console.log(`P1: ${Card[this.p1.card]} VS P2: ${Card[this.p2.card]}`);
        const winner = this.showdown(this.p1, this.p2);
        console.log(`${winner.id} wins`);
        winner.chips += this.current.pot;
      } else if (this.current.lastAction === Action.Fold) {
        this.turnPlayer.chips += this.current.pot;
      }

      this.state = State.ResetGame;
      return;
    }

    const action = this.turnPlayer.getAction(this.current.availableActions());
    const nextNode = this.current.children[action];
    if (!nextNode) {
      throw new Error(`No node available for action: ${action}`);
    }
    console.log(this.turnPlayer.id, action);

    if (action === Action.Bet || action === Action.Call) {
      this.bet(this.turnPlayer);
    }

    this.toggleTurnPlayer();
    this.current = nextNode;
  },

  reset() {
    this.p1.bet = 0;
    this.p2.bet = 0;

    this.state = State.Init;
  },

  toggleTurnPlayer() {
    if (!this.turnPlayer) return;

    if (this.turnPlayer.id === this.p1.id) {
      this.turnPlayer = this.p2;
    } else {
      this.turnPlayer = this.p1;
    }
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
