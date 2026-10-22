import { describe, expect, it } from "vitest";
import { parseTreeJson } from "./parse";
import sampleText from "./sample.json?raw";

const file = (name: string, size = 1) => ({ name, type: "file", size });
const folder = (name: string, children: unknown[]) => ({ name, type: "folder", children });

function errorOf(input: unknown): string {
  const result = parseTreeJson(JSON.stringify(input));
  if (result.ok) throw new Error("expected parse failure");
  return result.error;
}

describe("parseTreeJson", () => {
  it("accepts a valid tree", () => {
    expect(parseTreeJson(sampleText).ok).toBe(true);
  });

  it("accepts empty folders", () => {
    expect(parseTreeJson(JSON.stringify(folder("root", [folder("empty", [])]))).ok).toBe(true);
  });

  it("rejects invalid JSON", () => {
    expect(parseTreeJson("{ nope")).toEqual({ ok: false, error: "To nie jest poprawny JSON." });
  });

  it("requires the root to be a folder", () => {
    expect(errorOf(file("root"))).toMatch(/Korzeń/);
    expect(errorOf([])).toMatch(/Korzeń/);
  });

  it.each([
    [{ name: "a", type: "file" }, /size/],
    [{ name: "a", type: "file", size: -1 }, /size/],
    [{ name: "a", type: "file", size: "10" }, /size/],
    [{ name: "a", type: "folder" }, /children/],
    [{ name: "a", type: "symlink" }, /type/],
    [{ name: "", type: "file", size: 1 }, /name/],
    [{ name: "a/b", type: "file", size: 1 }, /Niedozwolona/],
    [{ name: "..", type: "file", size: 1 }, /Niedozwolona/],
    ["text", /obiektem/],
  ])("rejects invalid node %j", (node, message) => {
    expect(errorOf(folder("root", [node]))).toMatch(message);
  });

  it("rejects duplicate sibling names, which would make paths ambiguous", () => {
    expect(errorOf(folder("root", [file("a"), folder("a", [])]))).toBe('Folder "root" zawiera dwa elementy o nazwie "a".');
  });

  it("handles very deep nesting without stack overflow", () => {
    let json = JSON.stringify(file("leaf"));
    for (let i = 0; i < 50_000; i++) json = `{"name":"d","type":"folder","children":[${json}]}`;
    expect(parseTreeJson(`{"name":"root","type":"folder","children":[${json}]}`).ok).toBe(true);
  });
});
