import { useCallback, useEffect, useState } from "react";
import { expandedStorage } from "./storage";

/** Zbiór rozwiniętych folderów, zachowywany w sessionStorage. */
export function useExpanded() {
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(() => new Set(expandedStorage.read()));

  useEffect(() => {
    expandedStorage.write(expanded);
  }, [expanded]);

  const toggle = useCallback((path: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (!next.delete(path)) next.add(path);
      return next;
    });
  }, []);

  /** Rozwija podane foldery; nie zmienia stanu, jeśli wszystkie już są rozwinięte. */
  const expand = useCallback((paths: readonly string[]) => {
    setExpanded((prev) => (paths.every((p) => prev.has(p)) ? prev : new Set([...prev, ...paths])));
  }, []);

  return { expanded, toggle, expand };
}
