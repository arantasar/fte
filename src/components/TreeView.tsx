import { useEffect, useRef } from "react";
import { formatSize } from "../domain/formatSize";
import type { IndexedNode, TreeIndex } from "../domain/types";
import { ChevronIcon, NodeIcon } from "./icons";
import { NodeLink } from "./NodeLink";

interface TreeViewProps {
  index: TreeIndex;
  rows: IndexedNode[];
  expanded: ReadonlySet<string>;
  selectedPath: string;
  onToggle: (path: string) => void;
}

/**
 * Drzewo renderowane jako płaska lista widocznych wierszy z wcięciem zależnym od głębokości.
 * Przycisk ze strzałką rozwija/zwija folder, a nazwa jest linkiem do szczegółów.
 */
export function TreeView({ index, rows, expanded, selectedPath, onToggle }: TreeViewProps) {
  const rowRefs = useRef(new Map<string, HTMLLIElement>());

  // Przewija do wybranego węzła, np. po wejściu z linku albo odświeżeniu strony.
  useEffect(() => {
    rowRefs.current.get(selectedPath)?.scrollIntoView?.({ block: "nearest" });
  }, [selectedPath]);

  if (rows.length === 0) {
    return <p className="px-1 text-sm text-slate-500 dark:text-slate-400">Folder główny jest pusty.</p>;
  }

  return (
    <ul aria-label={`Drzewo plików: ${index.rootName}`} className="flex flex-col gap-px">
      {rows.map((row) => {
        const isFolder = row.type === "folder";
        const isOpen = isFolder && expanded.has(row.path);
        const selected = row.path === selectedPath;
        return (
          <li
            key={row.path}
            ref={(el) => {
              if (el) rowRefs.current.set(row.path, el);
              else rowRefs.current.delete(row.path);
            }}
            className={`row ${selected ? "row-selected" : ""}`}
            style={{ paddingLeft: `${(row.depth - 1) * 1.1 + 0.25}rem` }}
          >
            {isFolder ? (
              <button
                type="button"
                aria-expanded={isOpen}
                aria-label={`${isOpen ? "Zwiń" : "Rozwiń"} ${row.name}`}
                onClick={() => onToggle(row.path)}
                className="-m-1 rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-200"
              >
                <ChevronIcon open={isOpen} />
              </button>
            ) : (
              <span className="size-4 shrink-0" />
            )}
            <NodeLink path={row.path} aria-current={selected ? "page" : undefined} className="flex min-w-0 flex-1 items-center gap-1.5">
              <NodeIcon type={row.type} />
              <span className="min-w-0 flex-1 truncate">{row.name}</span>
              {!isFolder && <span className="shrink-0 text-xs tabular-nums text-slate-400">{formatSize(row.size)}</span>}
            </NodeLink>
          </li>
        );
      })}
    </ul>
  );
}
