import { describe, expect, it } from "vitest";
import { formatSize } from "./formatSize";
import { ancestorPaths, displayPath, nodeUrl } from "./paths";

describe("formatSize", () => {
  it.each([
    [0, "0 B"],
    [300, "300 B"],
    [1023, "1023 B"],
    [1024, "1.0 KB"],
    [1536, "1.5 KB"],
    [1572864, "1.5 MB"],
  ])("formats %d bytes as %s", (bytes, expected) => {
    expect(formatSize(bytes)).toBe(expected);
  });
});

describe("paths", () => {
  it("encodes the whole path as a single URL segment", () => {
    expect(nodeUrl("src/components/Button.tsx")).toBe("/tree/src%2Fcomponents%2FButton.tsx");
    expect(nodeUrl("a b/#c?.ts")).toBe("/tree/a%20b%2F%23c%3F.ts");
    expect(nodeUrl("")).toBe("/tree");
  });

  it("lists ancestors from the root", () => {
    expect(ancestorPaths("src/components/Button.tsx")).toEqual(["", "src", "src/components"]);
    expect(ancestorPaths("src")).toEqual([""]);
    expect(ancestorPaths("")).toEqual([]);
  });

  it("builds a display path including the root name", () => {
    expect(displayPath("root", "src/index.ts")).toBe("root/src/index.ts");
    expect(displayPath("root", "")).toBe("root");
  });
});
