import { displayPath } from "../domain/paths";
import type { IndexedNode, TreeIndex } from "../domain/types";
import { NodeIcon } from "./icons";
import { NodeLink } from "./NodeLink";

const MAX_SHOWN = 200;

interface SearchResultsProps {
  index: TreeIndex;
  query: string;
  results: IndexedNode[];
  selectedPath: string;
}

export function SearchResults({ index, query, results, selectedPath }: SearchResultsProps) {
  const shown = results.slice(0, MAX_SHOWN);

  return (
    <section aria-label="Wyniki wyszukiwania" className="flex min-h-0 flex-col gap-2">
      <p role="status" className="px-1 text-xs text-slate-500 dark:text-slate-400">
        {results.length === 0
          ? `Brak wyników dla „${query.trim()}”.`
          : results.length > MAX_SHOWN
            ? `Pokazano ${MAX_SHOWN} z ${results.length} wyników — doprecyzuj frazę.`
            : `Wyniki: ${results.length}`}
      </p>
      <ul className="flex flex-col gap-0.5 overflow-y-auto">
        {shown.map((node) => {
          const selected = node.path === selectedPath;
          return (
            <li key={node.path}>
              <NodeLink
                path={node.path}
                aria-current={selected ? "page" : undefined}
                className={`row flex-col items-start gap-0 ${selected ? "row-selected" : ""}`}
              >
                <span className="flex items-center gap-2">
                  <NodeIcon type={node.type} />
                  <span className="truncate">{node.name}</span>
                </span>
                <span className="w-full truncate pl-6 font-mono text-xs text-slate-500 dark:text-slate-400" title={displayPath(index.rootName, node.path)}>
                  {displayPath(index.rootName, node.path)}
                </span>
              </NodeLink>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
