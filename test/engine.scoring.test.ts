import { describe, expect, it } from "vitest";
import {
  evaluateScore,
  FLOWERY_PIG_POINTS,
  maxTenpaiScore,
  scoreForFan,
  settleDraw,
  settleKong,
  settleMultipleWins,
  settleWin,
  type ScorePayment
} from "../src/engine/scoring";
import { parseTiles } from "../src/engine/tiles";

describe("score fan table from rules-facts K", () => {
  it("maps fan values to the fixed base score and 8-fan cap", () => {
    expect(scoreForFan(1)).toBe(2);
    expect(scoreForFan(2)).toBe(4);
    expect(scoreForFan(6)).toBe(64);
    expect(scoreForFan(8)).toBe(256);
    expect(scoreForFan(9)).toBe(256);
  });

  it.each([
    ["pinhu", "1p 2p 3p 4p 5p 6p 7p 8p 9p 2t 2t 2t 5t 5t", 1, 2],
    ["no-terminals", "2p 3p 4p 3p 4p 5p 6p 7p 8p 2t 2t 2t 5t 5t", 1, 2],
    ["all-triplets", "2p 2p 2p 3p 3p 3p 4t 4t 4t 6t 6t 6t 8p 8p", 2, 4],
    ["pure-suit", "1p 2p 3p 2p 3p 4p 5p 6p 7p 8p 8p 8p 9p 9p", 3, 8],
    ["terminal-hand", "1p 2p 3p 7p 8p 9p 1t 1t 1t 9t 9t 9t 1p 1p", 3, 8],
    ["seven-pairs", "1p 1p 2p 2p 3p 3p 4p 4p 5t 5t 6t 6t 7t 7t", 3, 8],
    ["pure-all-triplets", "2p 2p 2p 3p 3p 3p 4p 4p 4p 6p 6p 6p 8p 8p", 4, 16],
    ["rank-pairs", "2p 2p 2p 5p 5p 5p 8t 8t 8t 2t 2t 2t 5t 5t", 4, 16],
    ["dragon-seven-pairs", "1p 1p 1p 1p 2p 2p 3p 3p 4p 4p 5t 5t 6t 6t", 5, 32],
    ["pure-seven-pairs", "1p 1p 2p 2p 3p 3p 4p 4p 5p 5p 6p 6p 7p 7p", 5, 32],
    ["pure-terminal-hand", "1p 2p 3p 1p 2p 3p 1p 2p 3p 7p 8p 9p 9p 9p", 5, 32],
    ["pure-dragon-seven-pairs", "1p 1p 1p 1p 2p 2p 3p 3p 4p 4p 5p 5p 6p 6p", 6, 64]
  ])("recognizes %s as the maximum pattern", (patternId, hand, fan, points) => {
    const result = evaluateScore(parseTiles(hand), { voidSuit: "w", source: "discard" });
    expect(result.winning).toBe(true);
    expect(result.pattern.id).toBe(patternId);
    expect(result.baseFan).toBe(fan);
    expect(result.patternPoints).toBe(points);
  });

  it("scores heavenly and earthly timing from table-provided state", () => {
    const hand = parseTiles("1p 2p 3p 4p 5p 6p 7p 8p 9p 2t 2t 2t 5t 5t");
    expect(evaluateScore(hand, { voidSuit: "w", source: "self-draw", winTiming: "heavenly" }).pattern.id).toBe("heavenly-hand");
    expect(evaluateScore(hand, { voidSuit: "w", source: "self-draw", winTiming: "earthly" }).pattern.id).toBe("earthly-hand");
  });

  it("adds Kong-draw, Kong-discard, and root fan, then caps at 8 fan", () => {
    const hand = parseTiles("1p 1p 1p 1p 2p 2p 3p 3p 4p 4p 5p 5p 6p 6p");
    const result = evaluateScore(hand, {
      voidSuit: "w",
      source: "self-draw",
      addOns: { kongDraw: true, kongDiscard: true, roots: 2 }
    });
    expect(result.pattern.id).toBe("pure-dragon-seven-pairs");
    expect(result.addFan).toBe(4);
    expect(result.totalFan).toBe(8);
    expect(result.capped).toBe(true);
    expect(result.patternPoints).toBe(256);
    expect(result.paymentPoints).toBe(258);
  });
});

describe("winning, Kong, and draw settlements", () => {
  it("settles discard wins, self-draw wins, and multi-win payments", () => {
    const hand = parseTiles("1p 2p 3p 4p 5p 6p 7p 8p 9p 2t 2t 2t 5t 5t");
    const discard = settleWin(hand, { voidSuit: "w", source: "discard", winner: 0, discarder: 2 });
    expect(discard.payments).toEqual([
      expect.objectContaining({ from: 2, to: 0, points: 2, kind: "win" })
    ]);

    const selfDraw = settleWin(hand, { voidSuit: "w", source: "self-draw", winner: 0 });
    expect(selfDraw.payments.map((payment) => payment.points)).toEqual([4, 4, 4]);
    expect(selfDraw.net[0]).toBe(12);

    const multi = settleMultipleWins([
      { hand, context: { voidSuit: "w", source: "discard", winner: 0, discarder: 3 } },
      { hand, context: { voidSuit: "w", source: "discard", winner: 1, discarder: 3 } }
    ]);
    expect(multi.payments).toHaveLength(2);
    expect(multi.net[3]).toBe(-4);
  });

  it("settles point, add-on, concealed, robbed Kong, and tax refund events", () => {
    expect(settleKong({ owner: 0, kind: "point", from: 2 }).payments).toEqual([
      expect.objectContaining({ from: 2, to: 0, points: 4, kind: "kong" })
    ]);
    expect(settleKong({ owner: 0, kind: "add-on" }).payments.map((payment) => payment.points)).toEqual([2, 2, 2]);
    expect(settleKong({ owner: 0, kind: "concealed" }).payments.map((payment) => payment.points)).toEqual([4, 4, 4]);
    expect(settleKong({ owner: 0, kind: "add-on", robbed: true }).payments).toEqual([]);

    const kongPayments: ScorePayment[] = [
      { from: 1, to: 2, points: 4, kind: "kong", reasonZh: "暗杠", reasonEn: "Concealed Kong" }
    ];
    const draw = settleDraw(
      [
        { id: 0, floweryPig: false, tenpai: true, hand: parseTiles("1p 2p 4p 5p 6p 7p 8p 9p 2t 2t 2t 5t 5t"), voidSuit: "w" },
        { id: 1, floweryPig: true, tenpai: false },
        { id: 2, floweryPig: false, tenpai: false },
        { id: 3, floweryPig: false, tenpai: false }
      ],
      { kongPayments }
    );
    expect(draw.payments).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ from: 1, to: 0, points: FLOWERY_PIG_POINTS, kind: "draw" }),
        expect.objectContaining({ from: 2, to: 0, points: 2, kind: "draw" }),
        expect.objectContaining({ from: 2, to: 1, points: 4, kind: "refund" })
      ])
    );
  });

  it("does not score invalid or uncleared hands", () => {
    const result = evaluateScore(parseTiles("1p 2p 3p 4p 5p 6p 7p 8p 9p 2t 2t 2t 5w 5w"), {
      voidSuit: "w",
      source: "discard"
    });
    expect(result.winning).toBe(false);
    expect(result.paymentPoints).toBe(0);
  });

  it("covers no-payment settlement edges without inventing values", () => {
    const invalid = parseTiles("1p 2p 3p 4p 5p 6p 7p 8p 9p 2t 2t 2t 5w 5w");
    expect(settleWin(invalid, { voidSuit: "w", source: "discard", winner: 0, discarder: 1 }).payments).toEqual([]);
    expect(settleKong({ owner: 0, kind: "point", from: 0 }).payments).toEqual([]);
    expect(settleDraw([{ id: 0, floweryPig: false, tenpai: false }], { skipTenpaiCheck: true }).notes).toHaveLength(1);
    expect(maxTenpaiScore({ id: 0, floweryPig: false, tenpai: true })).toEqual({ waits: [], maxFan: 0, maxPoints: 0 });
  });
});
