enum State {
  Init,
  Start,
  P1Action,
  P2Action,
  P1ActionFacingBet,
  P2ActionFacingBet,
  Showdown,
}

enum Card {
  Jack,
  Queen,
  King,
}

type Player = {
  chips: number;
  card: Card | null;
};

// TODO: Refactor into classes
function CreatePlayer(): Player {
  const player: Player = {
    chips: 100,
    card: null,
  };
  return player;
}

enum PlayerAction {
  Bet,
  Call,
  Check,
  Fold,
}

type GameState = {
  state: State;
  pot: number;

  p1: Player;
  p2: Player;

  loop: () => void;
  startGame: () => void;
  dealCards: () => void;
  showdown: () => void;
  p1Action: () => void;
  p2Action: () => void;
  p1ActionFacingBet: () => void;
  p2ActionFacingBet: () => void;
  awardPot: (p: Player) => void;
  playerBet: (p: Player) => void;
};

export const gameState: GameState = {
  state: State.Start,
  pot: 0,

  p1: CreatePlayer(),
  p2: CreatePlayer(),

  loop() {
    switch (this.state) {
      case State.Start:
        this.startGame();
        break;
      case State.P1Action:
        this.p1Action();
        break;
      case State.P2ActionFacingBet:
        this.p2ActionFacingBet();
        break;
      case State.P2Action:
        this.p2Action();
        break;
      case State.P1ActionFacingBet:
        this.p1ActionFacingBet();
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

    this.state = State.P1Action;
  },

  p1Action() {
    const actions = [PlayerAction.Bet, PlayerAction.Check];
    const action = actions[Math.floor(Math.random() * actions.length)];

    console.log(`P1 Action: ${PlayerAction[action]}`);

    if (action === PlayerAction.Bet) {
      this.p1.chips--;
      this.pot += 1;
      this.state = State.P2ActionFacingBet;
    } else {
      this.state = State.P2Action;
    }
  },
  p2Action() {
    const actions = [PlayerAction.Bet, PlayerAction.Check];
    const action = actions[Math.floor(Math.random() * actions.length)];

    console.log(`P2 Action: ${PlayerAction[action]}`);

    if (action === PlayerAction.Bet) {
      this.p2.chips--;
      this.pot += 1;
      this.state = State.P1ActionFacingBet;
    } else {
      this.state = State.Showdown;
    }
  },
  p1ActionFacingBet() {
    const actions = [PlayerAction.Call, PlayerAction.Fold];
    const action = actions[Math.floor(Math.random() * actions.length)];

    console.log(`P1 Action: ${PlayerAction[action]}`);

    if (action === PlayerAction.Call) {
      this.p1.chips--;
      this.pot += 1;
      this.state = State.Showdown;
    } else {
      console.log("Player #1 folds");
      this.awardPot(this.p2);
    }
  },
  p2ActionFacingBet() {
    const actions = [PlayerAction.Call, PlayerAction.Fold];
    const action = actions[Math.floor(Math.random() * actions.length)];

    console.log(`P2 Action: ${PlayerAction[action]}`);

    if (action === PlayerAction.Call) {
      this.p2.chips--;
      this.pot += 1;
      this.state = State.Showdown;
    } else {
      console.log("Player #2 folds");
      this.awardPot(this.p1);
    }
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
