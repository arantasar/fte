import { createContext } from "react";
import type { ParseResult } from "../domain/parse";
import type { TreeIndex } from "../domain/types";

export interface TreeContextValue {
  index: TreeIndex | null;
  load: (json: string) => ParseResult;
  clear: () => void;
}

export const TreeContext = createContext<TreeContextValue | null>(null);
