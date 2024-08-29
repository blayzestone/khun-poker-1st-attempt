enum State {
  Init,
  Start,
  P1Action,
  P2Action,
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

type GameState = {
  state: State;
  pot: number;

  p1: Player;
  p2: Player;

  loop: () => void;
  startGame: () => void;
  dealCards: () => void;
  showdown: () => void;
};

export const gameState: GameState = {
  state: State.Start,
  pot: 0,

  p1: { chips: 100, card: null },
  p2: { chips: 100, card: null },

  loop() {
    switch (this.state) {
      case State.Start:
        this.startGame();
        break;
      case State.Showdown:
        this.showdown();
        break;
    }
  },

  startGame() {
    console.log("Starting game");

    this.dealCards();

    this.state = State.Showdown;
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
    } else {
      console.log("Player #2 wins!");
    }

    this.state = State.Init;
  },
};
