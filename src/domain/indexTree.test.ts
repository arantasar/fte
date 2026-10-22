import { describe, expect, it } from "vitest";
import { indexTree } from "./indexTree";
import { parseTreeJson } from "./parse";
import type { FolderNode } from "./types";
import { searchTree } from "./search";
import { visibleRows } from "./visibleRows";

const tree: FolderNode = {
  name: "root",
  type: "folder",
  children: [
    {
      name: "src",
      type: "folder",
      children: [
        { name: "index.ts", type: "file", size: 1024 },
        { name: "components", type: "folder", children: [{ name: "Button.tsx", type: "file", size: 512 }] },
        { name: "empty", type: "folder", children: [] },
      ],
    },
    { name: "package.json", type: "file", size: 300 },
  ],
};

describe("indexTree", () => {
  const index = indexTree(tree);

  it("lists nodes in pre-order with paths relative to the root", () => {
    expect(index.nodes.map((n) => n.path)).toEqual([
      "",
      "src",
      "src/index.ts",
      "src/components",
      "src/components/Button.tsx",
      "src/empty",
      "package.json",
    ]);
  });

  it("computes subtree sizes", () => {
    expect(index.byPath.get("")).toMatchObject({ size: 1836, depth: 0, parentPath: null });
    expect(index.byPath.get("src")).toMatchObject({ size: 1536 });
    expect(index.byPath.get("src/empty")).toMatchObject({ size: 0, childPaths: [] });
    expect(index.byPath.get("src/components/Button.tsx")).toMatchObject({
      size: 512,
      depth: 3,
      parentPath: "src/components",
    });
  });

  it("keeps direct children in input order", () => {
    expect(index.byPath.get("src")?.childPaths).toEqual(["src/index.ts", "src/components", "src/empty"]);
  });

  it("handles very deep trees", () => {
    let json = '{"name":"leaf","type":"file","size":7}';
    for (let i = 0; i < 20_000; i++) json = `{"name":"d","type":"folder","children":[${json}]}`;
    const parsed = parseTreeJson(json);
    if (!parsed.ok) throw new Error(parsed.error);
    expect(indexTree(parsed.tree).byPath.get("")?.size).toBe(7);
  });
});

describe("searchTree", () => {
  const index = indexTree(tree);

  it("matches names case-insensitively across the whole tree", () => {
    expect(searchTree(index, "BUTTON").map((n) => n.path)).toEqual(["src/components/Button.tsx"]);
    expect(searchTree(index, ".ts").map((n) => n.path)).toEqual(["src/index.ts", "src/components/Button.tsx"]);
  });

  it("matches folders and skips the root", () => {
    expect(searchTree(index, "o").map((n) => n.path)).toEqual([
      "src/components",
      "src/components/Button.tsx",
      "package.json",
    ]);
  });

  it("returns nothing for a blank query", () => {
    expect(searchTree(index, "  ")).toEqual([]);
  });

});

describe("visibleRows", () => {
  const index = indexTree(tree);

  it("shows only root children when nothing is expanded", () => {
    expect(visibleRows(index, new Set()).map((n) => n.path)).toEqual(["src", "package.json"]);
  });

  it("shows children of expanded folders only if all ancestors are expanded", () => {
    expect(visibleRows(index, new Set(["src/components"])).map((n) => n.path)).toEqual(["src", "package.json"]);
    expect(visibleRows(index, new Set(["src", "src/components"])).map((n) => n.path)).toEqual([
      "src",
      "src/index.ts",
      "src/components",
      "src/components/Button.tsx",
      "src/empty",
      "package.json",
    ]);
  });

});
