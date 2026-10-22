import type { IndexedNode, TreeIndex } from "./types";

/**
 * Wyszukuje węzły, których nazwa zawiera frazę (bez rozróżniania wielkości liter).
 * Root jest pomijany, bo jego nazwa nie jest częścią ścieżek. Wyniki są w kolejności pre-order.
 */
export function searchTree(index: TreeIndex, query: string): IndexedNode[] {
  const needle = query.trim().toLocaleLowerCase();
  if (needle === "") return [];
  return index.nodes.filter((node) => node.parentPath !== null && node.nameLower.includes(needle));
}

