import { describe, expect, it } from "vitest";
import { chooseDiscard, decide, readyTilesAfterDiscard } from "../src/engine/ai";
import { buildCoachAdvice } from "../src/engine/coach";
import { bestDiscards, isTenpai, isWinningHand, waits } from "../src/engine/hand";
import {
  autoDeclareVoids,
  autoFinishGame,
  beginPlay,
  chooseVoidSuit,
  claimDiscard,
  claimSelfDrawWin,
  createTableGame,
  declareKongForCurrent,
  declareVoidSuit,
  discardForCurrent,
  drawForCurrent,
  finishDraw,
  getLegalActions,
  passClaim,
  playerWaits,
  runAutoUntilHuman,
  type PlayerState,
  type TableState
} from "../src/engine/table";
import { parseTiles, type TileCode } from "../src/engine/tiles";

describe("winning hand and waits", () => {
  it("accepts standard four-melds-plus-pair hands after void suit is cleared", () => {
    const hand = parseTiles("1p 2p 3p 4p 5p 6p 7p 8p 9p 2t 2t 2t 5t 5t");
    expect(isWinningHand(hand, "w")).toBe(true);
  });

  it("rejects structurally complete hands that still contain the declared void suit", () => {
    const hand = parseTiles("1p 2p 3p 4p 5p 6p 7p 8p 9p 2t 2t 2t 5w 5w");
    expect(isWinningHand(hand, "w")).toBe(false);
  });

  it("accepts seven pairs without adding any scoring value", () => {
    const hand = parseTiles("1p 1p 2p 2p 3p 3p 4p 4p 5t 5t 6t 6t 7t 7t");
    expect(isWinningHand(hand, "w")).toBe(true);
  });

  it("enumerates edge, closed, and pair waits", () => {
    expect(waits(parseTiles("1p 2p 4p 5p 6p 7p 8p 9p 2t 2t 2t 5t 5t"), "w")).toEqual(["3p"]);
    expect(waits(parseTiles("2p 4p 4p 5p 6p 7p 8p 9p 2t 2t 2t 5t 5t"), "w")).toEqual(["3p"]);
    expect(waits(parseTiles("1p 2p 3p 4p 5p 6p 7p 8p 9p 2t 2t 2t 5t"), "w")).toEqual(["5t"]);
  });

  it("uses internal Chow structure for winning shape but does not model Chow claims", () => {
    const hand = parseTiles("2p 3p 4p 3t 4t 5t 6t 7t 8t 7p 7p 7p 9p 9p");
    expect(isWinningHand(hand, "w")).toBe(true);
  });

  it("compares discard efficiency through wait counts", () => {
    const hand = parseTiles("1p 2p 4p 5p 6p 7p 8p 9p 2t 2t 2t 5t 5t 9t");
    const best = bestDiscards(hand, "w");
    expect(best[0].waitCount).toBeGreaterThan(0);
    expect(isTenpai(parseTiles("1p 2p 4p 5p 6p 7p 8p 9p 2t 2t 2t 5t 5t"), "w")).toBe(true);
  });

  it("rejects illegal copies and supports open meld hand checks", () => {
    expect(isWinningHand(parseTiles("5p 5p 5p 5p 5p 1p 2p 3p 4p 5p 6p 2t 2t 2t"), "w")).toBe(false);
    expect(isWinningHand(parseTiles("1p 2p 3p 4p 5p 6p 7t 8t 9t 5t 5t"), "w", { openMeldCount: 1 })).toBe(true);
    expect(isWinningHand(parseTiles("1p 2p 3p 4p 5p 6p 7t 8t 9t 5t 5t"), "w", { openMeldCount: 5 })).toBe(false);
    expect(waits(parseTiles("1p 2p 3w 4p"), "w")).toEqual([]);
    expect(waits(parseTiles("5p 5p 5p 5p 5p 1t 2t 3t 4t 5t"), "w")).toEqual([]);
  });
});

describe("ai decisions", () => {
  it("wins before choosing a discard", () => {
    const hand = parseTiles("1p 2p 3p 4p 5p 6p 7p 8p 9p 2t 2t 2t 5t 5t");
    const action = decide("balanced", { hand, voidSuit: "w", legalActions: ["win", "discard"] });
    expect(action.kind).toBe("win");
  });

  it("clears the declared void suit before efficiency discards", () => {
    const hand = parseTiles("1p 2p 3p 4t 5t 6t 7w 8w 9w 2t 2t 5p 5p 9w");
    expect(chooseDiscard("efficiency", hand, "w")).toBe("7w");
  });

  it("covers Kong, Pung, pass, and helper discard branches", () => {
    const kongHand = parseTiles("5p 5p 5p 5p 2t 3t 4t 6t 7t 8t 9t 9t 1p 2p");
    expect(decide("aggressive", { hand: kongHand, voidSuit: "w", legalActions: ["kong"] }).kind).toBe("kong");
    expect(decide("aggressive", { hand: parseTiles("5p 5p 5p 1p 3p 7p 9p 1t 2t 4t 5t 7t 8t"), voidSuit: "w", legalActions: ["kong"], claimedTile: "5p" }).kind).toBe("kong");
    expect(decide("conservative", { hand: kongHand, voidSuit: "w", legalActions: ["kong"] }).kind).toBe("pass");

    const pungHand = parseTiles("5p 5p 2t 3t 4t 6t 7t 8t 9t 9t 1p 2p 3p");
    expect(decide("aggressive", { hand: pungHand, voidSuit: "w", legalActions: ["pung"], claimedTile: "5p" }).kind).toBe("pung");
    expect(decide("efficiency", { hand: pungHand, voidSuit: "w", legalActions: ["pung"], claimedTile: "5p" }).kind).toBe("pung");
    expect(decide("balanced", { hand: pungHand, voidSuit: "p", legalActions: ["pung"], claimedTile: "5p" }).kind).toBe("pass");

    expect(decide("balanced", { hand: [], voidSuit: "w", legalActions: ["discard"] }).tile).toBeUndefined();
    expect(readyTilesAfterDiscard(parseTiles("1p 2p 4p 5p 6p 7p 8p 9p 2t 2t 2t 5t 5t 9t"), "w", "9t")).toEqual(["3p"]);

    const noWaitPung = parseTiles("5p 5p 1p 3p 7p 9p 1t 2t 4t 5t 7t 8t 9t");
    expect(decide("balanced", { hand: noWaitPung, voidSuit: "w", legalActions: ["pung"], claimedTile: "5p" }).kind).toBe("pung");

    const efficiencyHand = parseTiles("1p 2p 4p 5p 6p 7p 8p 9p 2t 2t 2t 5t 5t 9t");
    const conservativeBest = bestDiscards(efficiencyHand, "w").at(-1)?.tile;
    expect(chooseDiscard("conservative", efficiencyHand, "w")).toBe(conservativeBest);
    expect(chooseDiscard("conservative", parseTiles("1p 4p 7p 2t 5t 8t"), "w")).toBe("1p");
  });
});

describe("fight-to-the-end table state", () => {
  it("deals reproducibly and enters play after void declarations", () => {
    const first = beginPlay(autoDeclareVoids(createTableGame("same-seed")));
    const second = beginPlay(autoDeclareVoids(createTableGame("same-seed")));
    expect(first.players.map((player) => player.hand)).toEqual(second.players.map((player) => player.hand));
    expect(first.phase).toBe("playing");
    expect(first.players[0].voidSuit).toBeDefined();
    expect(first.players[0].hand).toHaveLength(14);
    expect(chooseVoidSuit(parseTiles("1p 2p 3t 4t 5w"))).toBe("w");
    expect(beginPlay(createTableGame("missing-void")).phase).toBe("void-selection");
    expect(declareVoidSuit(first, 0, "p")).toBe(first);
  });

  it("keeps the hand going after one player wins", () => {
    const state = withWinningHand(beginPlay(autoDeclareVoids(createTableGame("self-win"))), 0);
    const after = claimSelfDrawWin(state, 0);
    expect(after.players[0].won).toBe(true);
    expect(after.phase).toBe("playing");
    expect(after.winners).toContain(0);
    expect(after.currentPlayer).not.toBe(0);
  });

  it("finishes after three players have won", () => {
    let state = withWinningHand(beginPlay(autoDeclareVoids(createTableGame("three-winners"))), 0);
    state = claimSelfDrawWin(state, 0);
    state = withWinningHand({ ...state, currentPlayer: 1 }, 1);
    state = claimSelfDrawWin(state, 1);
    state = withWinningHand({ ...state, currentPlayer: 2 }, 2);
    state = claimSelfDrawWin(state, 2);
    expect(state.phase).toBe("finished");
    expect(state.endReason).toBe("three-winners");
    expect(state.settlement?.payments.length).toBeGreaterThan(0);
  });

  it("records dealer timing and table settlement for a finished hand", () => {
    let state = withWinningHand(beginPlay(autoDeclareVoids(createTableGame({ seed: "settled-wins", dealer: 0 }))), 0);
    state = claimSelfDrawWin(state, 0);
    expect(state.winEvents[0].winTiming).toBe("heavenly");
    expect(state.winEvents[0].result.pattern.id).toBe("heavenly-hand");

    state = withWinningHand({ ...state, currentPlayer: 1, turn: 2, drawCounts: { ...state.drawCounts, 1: 1 } }, 1);
    state = claimSelfDrawWin(state, 1);
    expect(state.winEvents[1].winTiming).toBe("earthly");

    state = withWinningHand({ ...state, currentPlayer: 2, turn: 8, drawCounts: { ...state.drawCounts, 2: 2 } }, 2);
    state = claimSelfDrawWin(state, 2);
    expect(state.phase).toBe("finished");
    expect(state.settlement?.results).toHaveLength(3);
    expect(state.settlement?.net[0]).toBeGreaterThan(0);
  });

  it("marks flowery pig and tenpai check on a wall-empty draw and settles teaching points", () => {
    const base = beginPlay(autoDeclareVoids(createTableGame("draw-flags")));
    const state: TableState = {
      ...base,
      wall: [],
      players: base.players.map((player, index) =>
        index === 0
          ? {
              ...player,
              voidSuit: "w",
              hand: parseTiles("1p 2p 4p 5p 6p 7p 8p 9p 2t 2t 2t 5t 5t") as TileCode[]
            }
          : {
              ...player,
              voidSuit: "w",
              hand: parseTiles("1p 2p 3p 4t 5t 6t 7w 8w 9w 2t 2t 5p 5p") as TileCode[]
            }
      )
    };
    const finished = finishDraw(state);
    expect(finished.phase).toBe("finished");
    expect(finished.players[0].tenpai).toBe(true);
    expect(finished.players[1].floweryPig).toBe(true);
    expect(finished.settlement?.payments).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ from: 1, to: 0, points: 32, kind: "draw" }),
        expect.objectContaining({ from: 1, to: 0, points: 2, kind: "draw" })
      ])
    );
  });

  it("pauses for human discard claims and supports pass, Pung, Kong, and discard-win claims", () => {
    const base = readyState("human-claim");
    const pending = discardForCurrent(
      withPlayers({ ...base, currentPlayer: 1 }, {
        0: { voidSuit: "w", hand: parseTiles("5p 5p 1p 2p 3p 4p 5p 6p 7t 8t 9t 2t 2t") },
        1: { voidSuit: "w", hand: parseTiles("5p 1t 2t 3t 4t 5t 6t 7p 8p 9p 3p 3p 4p 4p") }
      }),
      "5p"
    );
    expect(pending.pendingClaim?.candidates[0].playerId).toBe(0);
    expect(getLegalActions(pending, 0)).toContain("pung");
    expect(getLegalActions(pending, 2)).toEqual(["pass"]);

    const passed = passClaim(pending, 0);
    expect(passed.pendingClaim).toBeUndefined();

    const punged = claimDiscard(pending, 0, "pung");
    expect(punged.players[0].melds[0].kind).toBe("pung");
    expect(punged.currentPlayer).toBe(0);

    const kongPending = {
      ...pending,
      pendingClaim: { tile: "5p" as TileCode, by: 1 as const, candidates: [{ playerId: 0 as const, canWin: false, canPung: true, canKong: true }] }
    };
    const konged = claimDiscard(
      withPlayers(kongPending, { 0: { hand: parseTiles("5p 5p 5p 1p 2p 3p 4p 5p 6p 7t 8t 9t 2t") } }),
      0,
      "kong"
    );
    expect(konged.players[0].melds[0].kind).toBe("kong");

    const winPending = {
      ...pending,
      pendingClaim: { tile: "3p" as TileCode, by: 1 as const, candidates: [{ playerId: 0 as const, canWin: true, canPung: false, canKong: false }] }
    };
    const won = claimDiscard(
      withPlayers(winPending, { 0: { voidSuit: "w", hand: parseTiles("1p 2p 4p 5p 6p 7p 8p 9p 2t 2t 2t 5t 5t") } }),
      0,
      "win"
    );
    expect(won.players[0].won).toBe(true);
  });

  it("handles AI auto claims, Kong declaration, and auto run boundaries", () => {
    const autoPung = discardForCurrent(
      withPlayers(readyState("auto-pung"), {
        0: { hand: parseTiles("5p 1p 2p 3p 4p 5p 6p 7t 8t 9t 2t 2t 3t 4t") },
        1: { profile: "aggressive", voidSuit: "w", hand: parseTiles("5p 5p 1p 3p 7p 9p 1t 2t 4t 5t 7t 8t 9t") },
        2: { won: true },
        3: { won: true }
      }),
      "5p"
    );
    expect(autoPung.players[1].melds[0]?.kind).toBe("pung");

    const autoKong = discardForCurrent(
      withPlayers(readyState("auto-kong"), {
        0: { hand: parseTiles("5p 1p 2p 3p 4p 5p 6p 7t 8t 9t 2t 2t 3t 4t") },
        1: { profile: "aggressive", voidSuit: "w", hand: parseTiles("5p 5p 5p 1p 3p 7p 9p 1t 2t 4t 5t 7t 8t") },
        2: { won: true },
        3: { won: true }
      }),
      "5p"
    );
    expect(autoKong.players[1].melds[0]?.kind).toBe("kong");

    const autoWin = discardForCurrent(
      withPlayers(readyState("auto-win"), {
        0: { hand: parseTiles("3p 1p 2p 4p 5p 6p 7t 8t 9t 2t 2t 3t 4t 5t") },
        1: { voidSuit: "w", hand: parseTiles("1p 2p 4p 5p 6p 7p 8p 9p 2t 2t 2t 5t 5t") },
        2: { won: true },
        3: { won: true }
      }),
      "3p"
    );
    expect(autoWin.players[1].won).toBe(true);

    const kongState = declareKongForCurrent(
      withPlayers(readyState("self-kong"), {
        0: { hand: parseTiles("5p 5p 5p 5p 1p 2p 3p 4p 5p 6p 7t 8t 9t 2t") }
      }),
      "5p"
    );
    expect(kongState.players[0].melds[0].kind).toBe("kong");

    expect(drawForCurrent({ ...kongState, pendingClaim: { tile: "1p", by: 1, candidates: [] } })).toBeTruthy();
    expect(runAutoUntilHuman({ ...readyState("auto-boundary"), currentPlayer: 1 }, 2).phase).toBe("playing");
    expect(autoFinishGame(createTableGame("auto-finish"), 1).phase).toBe("finished");
    expect(playerWaits({ ...kongState.players[0], voidSuit: undefined })).toEqual([]);

    const autoPass = discardForCurrent(
      withPlayers(readyState("auto-pass"), {
        0: { hand: parseTiles("5p 1p 2p 3p 4p 5p 6p 7t 8t 9t 2t 2t 3t 4t") },
        1: { profile: "conservative", voidSuit: "w", hand: parseTiles("5p 5p 1p 3p 7p 9p 1t 2t 4t 5t 7t 8t 9t") },
        2: { won: true },
        3: { won: true }
      }),
      "5p"
    );
    expect(autoPass.pendingClaim).toBeUndefined();
    expect(autoPass.players[1].melds).toHaveLength(0);

    const aiSelfKong = runAutoUntilHuman(
      withPlayers({ ...readyState("ai-self-kong"), currentPlayer: 1 }, {
        1: { hand: parseTiles("5p 5p 5p 5p 1p 3p 7p 9p 1t 2t 4t 5t 7t 8t"), voidSuit: "w", profile: "aggressive" }
      }),
      1
    );
    expect(aiSelfKong.players[1].melds[0]?.kind).toBe("kong");

    const noAction = runAutoUntilHuman(
      withPlayers({ ...readyState("ai-no-action"), currentPlayer: 1 }, {
        1: { hand: [], voidSuit: "w" }
      }),
      1
    );
    expect(noAction.currentPlayer).not.toBe(1);

    const alreadyWon = runAutoUntilHuman(
      withPlayers({ ...readyState("ai-already-won"), currentPlayer: 1 }, { 1: { won: true } }),
      1
    );
    expect(alreadyWon.currentPlayer).not.toBe(1);

    const aiSelfWin = runAutoUntilHuman(withWinningHand({ ...readyState("ai-self-win"), currentPlayer: 1 }, 1), 1);
    expect(aiSelfWin.players[1].won).toBe(true);
  });

  it("keeps invalid or inactive table actions as no-ops", () => {
    const state = readyState("no-op");
    expect(drawForCurrent({ ...state, phase: "finished" })).toEqual({ ...state, phase: "finished" });
    expect(discardForCurrent({ ...state, phase: "finished" }, state.players[0].hand[0])).toEqual({ ...state, phase: "finished" });
    expect(passClaim(state, 0)).toBe(state);
    expect(claimDiscard(state, 0, "pung")).toBe(state);
    expect(claimDiscard({ ...state, pendingClaim: { tile: "1p", by: 1, candidates: [] } }, 0, "pung").pendingClaim).toBeDefined();
    expect(declareKongForCurrent(withPlayers(state, { 0: { hand: parseTiles("1p 2p 3p 4p 5p 6p 7t 8t 9t 2t 2t 3t 4t 5t") } }))).toBeTruthy();
    expect(claimSelfDrawWin(withPlayers(state, { 0: { hand: parseTiles("1p 1p 2p 4p 6p 8p 1t 3t 5t 7t 9t 2t 4t 6t") } }), 0).players[0].won).toBe(false);

    const allWon = withPlayers(state, {
      0: { won: true },
      1: { won: true },
      2: { won: true },
      3: { won: true }
    });
    expect(drawForCurrent(allWon).phase).toBe("finished");

    const finishedPending: TableState = {
      ...state,
      phase: "finished",
      pendingClaim: { tile: "1p", by: 1, candidates: [{ playerId: 0, canWin: false, canPung: true, canKong: false }] }
    };
    expect(passClaim(finishedPending, 0).phase).toBe("finished");
  });
});

describe("coach advice", () => {
  it("builds guided and direct advice from engine-derived waits", () => {
    const state = withWinningHand(beginPlay(autoDeclareVoids(createTableGame("coach"))), 0);
    const guided = buildCoachAdvice(state, 0, "guided");
    const direct = buildCoachAdvice(state, 0, "direct");
    expect(guided.steps.map((step) => step.id)).toContain("ready");
    expect(guided.conclusionZh).toContain("胡");
    expect(direct.steps).toHaveLength(1);
  });

  it("covers off, no-void, void-clearing, and claim advice paths", () => {
    const base = createTableGame("coach-branches");
    expect(buildCoachAdvice(base, 0, "off").steps).toEqual([]);
    expect(buildCoachAdvice(base, 0, "guided").weakTerms).toContain("void-suit");

    const withVoidTile = withPlayers(readyState("coach-void"), {
      0: { voidSuit: "w", hand: parseTiles("1w 1p 2p 3p 4p 5p 6p 2t 3t 4t 5t 5t 6t 7t") }
    });
    expect(buildCoachAdvice(withVoidTile, 0, "guided").conclusionZh).toContain("清定缺");
    const efficiencyCoach = withPlayers(readyState("coach-efficiency"), {
      0: { voidSuit: "w", hand: parseTiles("1p 2p 4p 5p 6p 7p 8p 9p 2t 2t 2t 5t 5t 9t") }
    });
    expect(buildCoachAdvice(efficiencyCoach, 0, "guided").conclusionZh).toContain("建议打");

    const claimState: TableState = {
      ...withVoidTile,
      pendingClaim: { tile: "5p", by: 1, candidates: [{ playerId: 0, canWin: false, canPung: true, canKong: false }] }
    };
    expect(buildCoachAdvice(claimState, 0, "direct").steps[0].id).toBe("claim");
    expect(buildCoachAdvice({ ...claimState, pendingClaim: { tile: "5p", by: 1, candidates: [{ playerId: 0, canWin: true, canPung: false, canKong: false }] } }, 0, "guided").conclusionZh).toContain("能胡");
    expect(buildCoachAdvice({ ...claimState, pendingClaim: { tile: "5p", by: 1, candidates: [{ playerId: 0, canWin: false, canPung: true, canKong: true }] } }, 0, "guided").conclusionZh).toContain("可以杠");
    expect(buildCoachAdvice({ ...claimState, pendingClaim: { tile: "5p", by: 1, candidates: [{ playerId: 0, canWin: false, canPung: false, canKong: false }] } }, 0, "guided").conclusionZh).toContain("建议过");
    expect(buildCoachAdvice({ ...claimState, pendingClaim: { tile: "5p", by: 1, candidates: [] } }, 0, "guided").steps).toEqual([]);
  });
});

function withWinningHand(state: TableState, playerId: 0 | 1 | 2 | 3): TableState {
  return {
    ...state,
    phase: "playing",
    players: state.players.map((player) =>
      player.id === playerId
        ? ({
            ...player,
            voidSuit: "w",
            hand: parseTiles("1p 2p 3p 4p 5p 6p 7p 8p 9p 2t 2t 2t 5t 5t") as TileCode[],
            melds: [],
            won: false,
            revealed: []
          } satisfies PlayerState)
        : player
    )
  };
}

function readyState(seed: string): TableState {
  return beginPlay(autoDeclareVoids(createTableGame(seed)));
}

function withPlayers(
  state: TableState,
  patches: Partial<Record<0 | 1 | 2 | 3, Partial<PlayerState>>>
): TableState {
  return {
    ...state,
    phase: "playing",
    players: state.players.map((player) => {
      const patch = patches[player.id];
      return patch ? ({ ...player, ...patch, hand: patch.hand ? sortForTest(patch.hand) : player.hand } as PlayerState) : player;
    })
  };
}

function sortForTest(tiles: readonly TileCode[]): TileCode[] {
  return [...tiles].sort();
}
