import { describe, expect, it } from "vitest";
import {
  countBySuit,
  createWall,
  dealHands,
  isVoidSuitCleared,
  makeSeededRandom,
  parseTile,
  parseTileCode,
  parseTiles,
  shuffleTiles,
  sortTileCodes,
  tileName
} from "../src/engine/tiles";

describe("tiles", () => {
  it("builds the 108-tile Sichuan Mahjong wall with no honor tiles", () => {
    const wall = createWall();
    expect(wall).toHaveLength(108);
    expect(countBySuit(wall.map((tile) => tile.code))).toEqual({ p: 36, t: 36, w: 36 });
    expect(wall.filter((tile) => tile.code === "5p")).toHaveLength(4);
    expect(wall.every((tile) => ["p", "t", "w"].includes(tile.suit))).toBe(true);
  });

  it("parses compact tile notation and rejects invalid notation", () => {
    expect(parseTileCode("3t")).toBe("3t");
    expect(parseTile("7W")).toEqual({ rank: 7, suit: "w", code: "7w" });
    expect(parseTiles("3t 4t 5t 7w")).toEqual(["3t", "4t", "5t", "7w"]);
    expect(() => parseTileCode("10p")).toThrow(/Invalid tile notation/);
    expect(() => parseTileCode("1z")).toThrow(/Invalid tile notation/);
  });

  it("names suits with source-of-truth English terms", () => {
    expect(tileName("5p")).toEqual({ zh: "5筒", en: "5 Dots" });
    expect(tileName("3t")).toEqual({ zh: "3条", en: "3 Bamboo" });
    expect(tileName("7w")).toEqual({ zh: "7万", en: "7 Characters" });
  });

  it("shuffles and deals reproducibly with injected seed random", () => {
    const first = dealHands({ random: makeSeededRandom("phase-1"), handSize: 3 });
    const second = dealHands({ random: makeSeededRandom("phase-1"), handSize: 3 });
    expect(first.hands.map((hand) => hand.map((tile) => tile.code))).toEqual(
      second.hands.map((hand) => hand.map((tile) => tile.code))
    );
    expect(first.hands).toHaveLength(4);
    expect(first.hands[0]).toHaveLength(3);
    expect(first.wall).toHaveLength(96);
  });

  it("refuses to deal more tiles than the 108-tile wall contains", () => {
    expect(() => dealHands({ playerCount: 4, handSize: 28 })).toThrow(/Not enough tiles/);
  });

  it("supports deterministic shuffle without mutating the source", () => {
    const source = ["1p", "2p", "3p", "4p"] as const;
    const shuffled = shuffleTiles(source, makeSeededRandom(42));
    expect(source).toEqual(["1p", "2p", "3p", "4p"]);
    expect(shuffled).toHaveLength(4);
    expect(shuffled).not.toBe(source);
  });

  it("checks declared void suit state and stable suit sorting", () => {
    expect(isVoidSuitCleared(["1p", "2t", "3t"], "w")).toBe(true);
    expect(isVoidSuitCleared(["1p", "2t", "3w"], "w")).toBe(false);
    expect(sortTileCodes(["9w", "1t", "5p", "2p"])).toEqual(["2p", "5p", "1t", "9w"]);
  });
});
