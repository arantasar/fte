import { ancestorPaths } from "../domain/paths";
import type { TreeIndex } from "../domain/types";
import { NodeLink } from "./NodeLink";

export function Breadcrumbs({ index, path }: { index: TreeIndex; path: string }) {
  const current = index.byPath.get(path);
  if (!current) return null;
  const ancestors = ancestorPaths(path).map((p) => index.byPath.get(p)!);

  return (
    <nav aria-label="Ścieżka" className="text-sm text-slate-500 dark:text-slate-400">
      <ol className="flex flex-wrap items-center gap-1">
        {ancestors.map((node) => (
          <li key={node.path} className="flex items-center gap-1">
            <NodeLink path={node.path} className="hover:text-slate-900 hover:underline dark:hover:text-slate-100">
              {node.name}
            </NodeLink>
            <span aria-hidden="true">/</span>
          </li>
        ))}
        <li aria-current="page" className="font-medium text-slate-900 dark:text-slate-100">
          {current.name}
        </li>
      </ol>
    </nav>
  );
}
