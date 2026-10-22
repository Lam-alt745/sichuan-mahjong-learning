import { describe, expect, it } from "vitest";
import { bestDiscards } from "../src/engine/hand";
import { remainingCounts, waitsWithCounts } from "../src/engine/probability";
import { parseTiles } from "../src/engine/tiles";

describe("remaining tile counts", () => {
  it("subtracts visible tiles from the four-copy wall deterministically", () => {
    const counts = remainingCounts(["3p", "3p", "3p", "3p", "5t"]);
    expect(counts.get("3p")).toBe(0);
    expect(counts.get("5t")).toBe(3);
    expect(counts.get("9w")).toBe(4);
  });

  it("attaches remaining counts to waits and exposes dead waits", () => {
    const hand = parseTiles("1p 2p 4p 5p 6p 7p 8p 9p 2t 2t 2t 5t 5t");
    const live = waitsWithCounts(hand, "w", hand);
    expect(live.waits).toEqual([{ tile: "3p", remaining: 4 }]);
    expect(live.totalRemaining).toBe(4);

    const dead = waitsWithCounts(hand, "w", [...hand, "3p", "3p", "3p", "3p"]);
    expect(dead.waits).toEqual([{ tile: "3p", remaining: 0 }]);
    expect(dead.totalRemaining).toBe(0);
  });

  it("keeps unweighted discard efficiency while allowing visible-tile weighting", () => {
    const hand = parseTiles("1p 2p 4p 5p 6p 7p 8p 9p 2t 2t 2t 5t 5t 9t");
    const unweighted = bestDiscards(hand, "w");
    const weighted = bestDiscards(hand, "w", {
      weighted: true,
      visible: [...hand, "3p", "3p", "3p", "3p"]
    });
    expect(unweighted[0].waitCount).toBeGreaterThan(0);
    expect(weighted[0].remainingCount).toBeGreaterThanOrEqual(0);
    expect(weighted[0].efficiencyScore).toBe(weighted[0].remainingCount);
  });
});
