/**
 * @jest-environment jsdom
 */

const { getNoteFromFrequency } = require("../scripts/audiobell");

describe("Note from frequency", function () {
  const base = 440;
  const system = "english";

  test("Get note from 63.77 Hz", () => {
    expect(getNoteFromFrequency(63.77, base, system)).toBe("C2 (-7/16)");
  });

  test("Get note from 7449.71 Hz", () => {
    expect(getNoteFromFrequency(7449.71, base, system)).toBe("A♯8 parfait");
  });

  test("Get note from 391.98 Hz", () => {
    expect(getNoteFromFrequency(391.98, base, system)).toBe("G4 parfait");
  });

  test("Get note from 392 Hz", () => {
    expect(getNoteFromFrequency(392, base, system)).toBe("G4 parfait");
  });

  test("Get note from 404.93 Hz", () => {
    expect(getNoteFromFrequency(404.93, base, system)).toBe("G♯4 (-7/16)");
  });

  test("Get note from 404.95 Hz", () => {
    expect(getNoteFromFrequency(404.95, base, system)).toBe("G♯4 (-7/16)");
  });

  test("Get note from 439.9 Hz", () => {
    expect(getNoteFromFrequency(439.9, base, system)).toBe("A4 parfait");
  });

  test("Get note from 440.1 Hz", () => {
    expect(getNoteFromFrequency(440.1, base, system)).toBe("A4 parfait");
  });
});
