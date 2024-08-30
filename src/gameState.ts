enum State {
  Init,
  Start,
  Action,
  WaitingAction,
  Showdown,
}

enum Card {
  Jack,
  Queen,
  King,
}

type Player = {
  id: string;
  chips: number;
  card: Card | null;
  getAction(): PlayerAction.Bet | PlayerAction.Check;
  getActionFacingBet(): PlayerAction.Call | PlayerAction.Fold;
};

// TODO: Refactor into classes
function CreatePlayer(id: string): Player {
  const player: Player = {
    id: id,
    chips: 100,
    card: null,

    getAction() {
      return Math.floor(Math.random() * 2) === 0
        ? PlayerAction.Bet
        : PlayerAction.Check;
    },
    getActionFacingBet() {
      return Math.floor(Math.random() * 2) === 0
        ? PlayerAction.Call
        : PlayerAction.Fold;
    },
  };
  return player;
}

enum PlayerAction {
  Bet,
  Call,
  Check,
  Fold,
}

type GameTreeNode = {
  player: Player;
  action: PlayerAction | null;
  payoff: [number, number];
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
  dealCards: () => void;
  showdown: () => void;
  action: (current: GameTreeNode) => void;
  awardPot: (p: Player) => void;
  playerBet: (p: Player) => void;
};

export const gameState: GameState = {
  state: State.Start,
  pot: 0,

  p1: CreatePlayer("player1"),
  p2: CreatePlayer("player2"),

  gameTreeRoot: null,

  loop() {
    switch (this.state) {
      case State.Start:
        this.startGame();
        break;
      case State.Action:
        if (!this.gameTreeRoot) return;
        this.action(this.gameTreeRoot);
        console.log(this.gameTreeRoot);
        this.state = State.WaitingAction;
        break;
      case State.Showdown:
        this.showdown();
        break;
    }
  },

  startGame() {
    console.log("Starting game");

    this.dealCards();

    // Ante
    this.p1.chips--;
    this.p2.chips--;
    this.pot += 2;

    this.gameTreeRoot = {
      player: this.p1,
      payoff: [0, 0],
      action: null,
      children: {},
    };

    this.state = State.Action;
  },

  action(current: GameTreeNode) {
    if (current.action === PlayerAction.Call) {
      console.log("Called down");
      if (this.p1.card === null || this.p2.card === null) return;
      // Need to compare cards to determine who gets the payoff
      if (this.p1.card > this.p2.card) {
        current.payoff = [this.pot, 0];
        this.awardPot(this.p1);
      } else {
        current.payoff = [0, this.pot];
        this.awardPot(this.p2);
      }
    }

    if (current.action === PlayerAction.Fold) {
      // Set payoff values based to whoever didnt fold
      if (current.player.id === "player1") {
        console.log("Player2 folded");
        current.payoff = [this.pot, 0];
      } else {
        console.log("Player1 folded");
        current.payoff = [0, this.pot];
      }
      this.awardPot(current.player);
      return;
    }

    const player = current.player.id === "player1" ? this.p2 : this.p1;
    const action =
      current.action === PlayerAction.Bet
        ? current.player.getActionFacingBet()
        : current.player.getAction();

    const nextNode: GameTreeNode = {
      player: player,
      action: action,
      payoff: [0, 0],
      children: {},
    };

    console.log(current.player.id, PlayerAction[action]);

    // Basically if the second player check this state could only happen from check, check
    // which leads to showdown and therefore payoff
    if (
      current.player.id === "player2" &&
      current.action === PlayerAction.Check &&
      action === PlayerAction.Check
    ) {
      console.log("showdown");
      this.state = State.Showdown;
      return;
      //   if (this.p1.card === null || this.p2.card === null) return;
      //   // Need to compare cards to determine who gets the payoff
      //   if (this.p1.card > this.p2.card) {
      //     this.gameTreeCurrent.payoff = [this.pot, 0];
      //     this.awardPot(this.p1);
      //   } else {
      //     this.gameTreeCurrent.payoff = [0, this.pot];
      //     this.awardPot(this.p2);
      //   }
    }

    current.children[action] = nextNode;
    this.action(nextNode);
  },

  dealCards() {
    const deck = [Card.Jack, Card.Queen, Card.King];

    const card1 = deck.splice(Math.floor(Math.random() * deck.length), 1)[0];
    const card2 = deck.splice(Math.floor(Math.random() * deck.length), 1)[0];

    console.log("deal cards");

    this.p1.card = card1;
    this.p2.card = card2;
  },

  showdown() {
    if (this.p1.card === null || this.p2.card === null) return;

    console.log(`P1: ${Card[this.p1.card]} VS P2: ${Card[this.p2.card]}`);

    if (this.p1.card > this.p2.card) {
      console.log("Player #1 wins!");
      this.awardPot(this.p1);
    } else {
      console.log("Player #2 wins!");
      this.awardPot(this.p2);
    }
  },

  awardPot(p: Player) {
    p.chips += this.pot;
    this.pot = 0;

    console.log(`P1: ${this.p1.chips}bb | P2: ${this.p2.chips}bb`);

    this.state = State.Init;
  },

  playerBet(p: Player) {
    p.chips -= 1;
    this.pot += 1;
  },
};
