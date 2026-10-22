import { useCallback, useMemo, useState, type ReactNode } from "react";
import { indexTree } from "../domain/indexTree";
import { parseTreeJson, type ParseResult } from "../domain/parse";
import type { TreeIndex } from "../domain/types";
import { expandedStorage, treeStorage } from "./storage";
import { TreeContext, type TreeContextValue } from "./treeContext";

function restore(): TreeIndex | null {
  const json = treeStorage.read();
  if (json === null) return null;
  const result = parseTreeJson(json);
  if (result.ok) return indexTree(result.tree);
  // Uszkodzone dane w storage - usuwamy je zamiast pokazywać błąd przy każdym starcie.
  treeStorage.clear();
  return null;
}

export function TreeProvider({ children }: { children: ReactNode }) {
  const [index, setIndex] = useState(restore);

  const load = useCallback((json: string): ParseResult => {
    const result = parseTreeJson(json);
    if (!result.ok) return result;
    treeStorage.write(json);
    expandedStorage.clear();
    setIndex(indexTree(result.tree));
    return result;
  }, []);

  const clear = useCallback(() => {
    treeStorage.clear();
    expandedStorage.clear();
    setIndex(null);
  }, []);

  const value = useMemo<TreeContextValue>(() => ({ index, load, clear }), [index, load, clear]);
  return <TreeContext.Provider value={value}>{children}</TreeContext.Provider>;
}
