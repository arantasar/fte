import { useContext } from "react";
import { TreeContext, type TreeContextValue } from "./treeContext";

export function useTree(): TreeContextValue {
  const value = useContext(TreeContext);
  if (!value) throw new Error("useTree must be used inside <TreeProvider>");
  return value;
}
