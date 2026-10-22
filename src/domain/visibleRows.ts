import type { IndexedNode, TreeIndex } from "./types";

/**
 * Lista wierszy widocznych w drzewie: dzieci roota oraz potomkowie rozwiniętych folderów,
 * w kolejności pre-order. Płaska lista ułatwia nawigację klawiaturą i ewentualną wirtualizację.
 */
export function visibleRows(index: TreeIndex, expanded: ReadonlySet<string>): IndexedNode[] {
  const rows: IndexedNode[] = [];
  const root = index.byPath.get("");
  if (!root) return rows;

  const stack = [...root.childPaths].reverse();
  while (stack.length > 0) {
    const node = index.byPath.get(stack.pop()!)!;
    rows.push(node);
    if (node.type === "folder" && expanded.has(node.path)) {
      for (let i = node.childPaths.length - 1; i >= 0; i--) stack.push(node.childPaths[i]);
    }
  }
  return rows;
}

