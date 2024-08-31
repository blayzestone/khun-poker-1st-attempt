export enum State {
  Init,
  SetupGame,
  BuildGameTree,
  PlayGame,
  ResetGame,
}

export enum Card {
  Jack,
  Queen,
  King,
}

export enum Action {
  Bet = "bet",
  Call = "call",
  Check = "check",
  Fold = "fold",
}
