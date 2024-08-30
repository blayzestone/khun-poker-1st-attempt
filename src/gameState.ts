import { CreatePlayer, Player, PlayerAction, PlayerCards } from "./player";

enum State {
  Init,
  SetupGame,
  BuildGameTree,
  PlayGame,
}

export enum Card {
  Jack,
  Queen,
  King,
}

type GameTreeNode = {
  player: Player;
  cards: PlayerCards;
  action: PlayerAction | null;
  probability: number;
  payoff: [number, number];
  parent: GameTreeNode | null;
  terminal: boolean; // Game end node
  children: {
    [key in PlayerAction]?: GameTreeNode;
  };
};

type GameState = {
  state: State;
  pot: number;

  p1: Player;
  p2: Player;

  gameTreeRoot: GameTreeNode | null;

  loop: () => void;
  startGame: () => void;
  dealCards: () => PlayerCards;
  buildGameTree: (current: GameTreeNode) => void;
  playGame: (current: GameTreeNode) => void;
  awardPot: (p: Player) => void;
};

export const gameState: GameState = {
  state: State.SetupGame,
  pot: 0,

  p1: CreatePlayer("player1"),
  p2: CreatePlayer("player2"),

  gameTreeRoot: null,

  loop() {
    switch (this.state) {
      case State.SetupGame:
        this.startGame();
        break;
      case State.BuildGameTree:
        if (!this.gameTreeRoot) return;
        this.buildGameTree(this.gameTreeRoot);
        console.log("game tree", this.gameTreeRoot);
        this.state = State.PlayGame;
        break;
      case State.PlayGame:
        if (!this.gameTreeRoot) return;
        console.log("Playing game");
        this.playGame(this.gameTreeRoot);
        this.state = State.Init;
        break;
    }
  },

  startGame() {
    console.log("Starting game");

    // Ante
    this.p1.chips--;
    this.p2.chips--;
    this.pot += 2;

    this.gameTreeRoot = {
      player: this.p1,
      cards: this.dealCards(),
      payoff: [0, 0],
      probability: -1, // not sure what this should be for first turn.
      action: null,
      parent: null,
      terminal: false,
      children: {},
    };

    this.state = State.BuildGameTree;
  },

  buildGameTree(current: GameTreeNode) {
    if (current.action === PlayerAction.Call) {
      if (current.cards.player1 > current.cards.player1) {
        current.payoff = [this.pot, 0];
      } else {
        current.payoff = [0, this.pot];
      }
      current.terminal = true;
      return;
    }
    if (current.action === PlayerAction.Fold) {
      // Set payoff values based to whoever didnt fold
      if (current.player.id === "player1") {
        current.payoff = [this.pot, 0];
      } else {
        current.payoff = [0, this.pot];
      }
      current.terminal = true;
      return;
    }
    // If both players have checked, go to showdown
    if (
      current.parent &&
      current.parent.action === PlayerAction.Check &&
      current.action === PlayerAction.Check
    ) {
      if (current.cards.player1 > current.cards.player2) {
        current.payoff = [this.pot, 0];
      } else {
        current.payoff = [0, this.pot];
      }
      current.terminal = true;
      return;
    }

    const player = current.player.id === "player1" ? this.p2 : this.p1;
    const playerCard = current.cards[player.id];
    let actions: PlayerAction[] = [];
    if (current.action === PlayerAction.Bet) {
      actions = [PlayerAction.Call, PlayerAction.Fold];
    } else {
      actions = [PlayerAction.Bet, PlayerAction.Check];
    }

    for (const a of actions) {
      const nextNode: GameTreeNode = {
        player: player,
        cards: current.cards,
        action: a,
        probability: player.strategy[playerCard][a],
        payoff: [0, 0],
        parent: current,
        terminal: false,
        children: {},
      };
      current.children[a] = nextNode;
      this.buildGameTree(nextNode);
    }
  },

  playGame(current: GameTreeNode) {
    if (current.terminal) {
      if (current.action === PlayerAction.Fold) {
        this.awardPot(current.player);
        return;
      }

      // Call or Check
      console.log(
        `P1: ${Card[current.cards.player1]} VS P2: ${
          Card[current.cards.player2]
        }`
      );
      if (current.cards.player1 > current.cards.player2) {
        this.awardPot(this.p1);
      } else {
        this.awardPot(this.p2);
      }
    }
    if (current.action === PlayerAction.Bet) {
      const action = current.player.getActionFacingBet();
      const nextGameNode = current.children[action];
      if (nextGameNode) {
        console.log(current.player.id, action);
        this.playGame(nextGameNode);
      }
    } else {
      const action = current.player.getAction();
      const nextGameNode = current.children[action];
      if (nextGameNode) {
        console.log(current.player.id, action);
        this.playGame(nextGameNode);
      }
    }
  },

  dealCards(): PlayerCards {
    const deck = [Card.Jack, Card.Queen, Card.King];

    return {
      player1: deck.splice(Math.floor(Math.random() * deck.length), 1)[0],
      player2: deck.splice(Math.floor(Math.random() * deck.length), 1)[0],
    };
  },

  awardPot(p: Player) {
    p.chips += this.pot;
    this.pot = 0;

    console.log(`P1: ${this.p1.chips}bb | P2: ${this.p2.chips}bb`);

    this.state = State.Init;
  },
};
