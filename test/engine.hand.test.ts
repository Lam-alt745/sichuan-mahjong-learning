import { describe, expect, it } from "vitest";
import { evalMeld } from "../src/engine/hand";

describe("evalMeld", () => {
  it("detects Pung triplets and marks them claimable in Sichuan Mahjong", () => {
    const result = evalMeld(["5p", "5p", "5p"]);
    expect(result.kind).toBe("pung");
    expect(result.labelEn).toBe("Pung");
    expect(result.isMeldStructure).toBe(true);
    expect(result.canBeClaimedInSichuan).toBe(true);
  });

  it("detects Chow structures but marks discard-claiming as not allowed", () => {
    const result = evalMeld(["3t", "4t", "5t"]);
    expect(result.kind).toBe("chow");
    expect(result.labelEn).toBe("Chow");
    expect(result.isMeldStructure).toBe(true);
    expect(result.canBeClaimedInSichuan).toBe(false);
    expect(result.reasonZh).toContain("不可吃");
  });

  it("separates pairs from Pung and Chow", () => {
    const result = evalMeld(["7w", "7w"]);
    expect(result.kind).toBe("pair");
    expect(result.labelZh).toBe("对将");
    expect(result.canBeClaimedInSichuan).toBe(false);
  });

  it("detects Kongs without using scoring rules", () => {
    const result = evalMeld(["2p", "2p", "2p", "2p"]);
    expect(result.kind).toBe("kong");
    expect(result.labelEn).toBe("Kong");
    expect(result.canBeClaimedInSichuan).toBe(true);
  });

  it("rejects cross-suit near sequences", () => {
    const result = evalMeld(["3p", "4t", "5p"]);
    expect(result.kind).toBe("none");
    expect(result.isMeldStructure).toBe(false);
  });

  it("rejects non-consecutive same-suit groups", () => {
    const result = evalMeld(["3t", "5t", "6t"]);
    expect(result.kind).toBe("none");
    expect(result.reasonEn).toContain("neither");
  });

  it("flags groups that still contain the declared void suit", () => {
    const result = evalMeld(["7w", "7w", "7w"], { voidSuit: "w" });
    expect(result.kind).toBe("pung");
    expect(result.containsVoidSuit).toBe(true);
    expect(result.reasonEn).toContain("declared void suit");
  });

  it("rejects invalid tile notation instead of guessing", () => {
    expect(() => evalMeld(["1z", "2z", "3z"])).toThrow(/Invalid tile notation/);
  });
});
