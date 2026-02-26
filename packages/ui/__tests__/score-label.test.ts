import { describe, expect, it } from "vitest";
import { scoreDescription, scoreLabel, scoreMeta } from "../src/index";

describe("score meta", () => {
  it("maps all integer scores to precise labels", () => {
    expect(scoreLabel(5)).toBe("高峰愉悦");
    expect(scoreLabel(4)).toBe("非常开心");
    expect(scoreLabel(3)).toBe("开心");
    expect(scoreLabel(2)).toBe("轻松积极");
    expect(scoreLabel(1)).toBe("略有愉悦");
    expect(scoreLabel(0)).toBe("平稳中性");
    expect(scoreLabel(-1)).toBe("轻微低落");
    expect(scoreLabel(-2)).toBe("低落紧绷");
    expect(scoreLabel(-3)).toBe("明显难受");
    expect(scoreLabel(-4)).toBe("强烈痛苦");
    expect(scoreLabel(-5)).toBe("极度痛苦");
  });

  it("clamps out-of-range values and exposes description", () => {
    expect(scoreMeta(10).score).toBe(5);
    expect(scoreMeta(-9).score).toBe(-5);
    expect(scoreDescription(2)).toContain("压力可控");
  });
});
