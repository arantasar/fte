import type { ReactNode } from "react";
import { useParams } from "react-router-dom";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { NodeIcon } from "../components/icons";
import { NodeLink } from "../components/NodeLink";
import { formatSize } from "../domain/formatSize";
import { displayPath, ROOT_PATH } from "../domain/paths";
import type { IndexedNode, TreeIndex } from "../domain/types";
import { useTree } from "../state/useTree";

export function NodeDetails() {
  // React Router zwraca parametr już zdekodowany ("src%2Fa.ts" → "src/a.ts"), więc nie dekodujemy go ponownie.
  const { nodePath = ROOT_PATH } = useParams();
  const { index } = useTree();
  if (!index) return null;

  const node = index.byPath.get(nodePath);
  if (!node) {
    return (
      <section className="panel p-6">
        <h1 className="text-lg font-semibold">Nie znaleziono węzła</h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">
          W drzewie nie ma ścieżki <code className="code">{nodePath}</code>.
        </p>
        <NodeLink path={ROOT_PATH} className="btn-secondary mt-4 inline-flex">
          Wróć do katalogu głównego
        </NodeLink>
      </section>
    );
  }

  const fullPath = displayPath(index.rootName, node.path);

  return (
    <article className="panel flex flex-col gap-5 p-6" aria-labelledby="node-title">
      <Breadcrumbs index={index} path={node.path} />
      <header className="flex items-center gap-3">
        <NodeIcon type={node.type} className="size-7" />
        <h1 id="node-title" className="min-w-0 break-all text-xl font-semibold">
          {node.name}
        </h1>
        <span className="badge">{node.type === "folder" ? "Folder" : "Plik"}</span>
      </header>

      <dl className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-[max-content_1fr]">
        <Field label="Nazwa">{node.name}</Field>
        <Field label="Pełna ścieżka">
          <code className="code break-all">{fullPath}</code>
        </Field>
        {node.type === "file" ? (
          <Field label="Rozmiar">{formatSize(node.size)}</Field>
        ) : (
          <>
            <Field label="Bezpośrednie dzieci">{node.childPaths.length}</Field>
            <Field label="Całkowity rozmiar">{formatSize(node.size)}</Field>
          </>
        )}
      </dl>

      {node.type === "folder" && <ChildrenList index={index} node={node} />}
    </article>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <>
      <dt className="font-medium text-slate-500 dark:text-slate-400">{label}</dt>
      <dd className="min-w-0">{children}</dd>
    </>
  );
}

function ChildrenList({ index, node }: { index: TreeIndex; node: IndexedNode }) {
  if (node.childPaths.length === 0) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">Folder jest pusty.</p>;
  }
  return (
    <section aria-labelledby="children-title" className="flex flex-col gap-2">
      <h2 id="children-title" className="text-sm font-semibold">
        Zawartość
      </h2>
      <ul className="divide-y divide-slate-200 overflow-hidden rounded-lg border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
        {node.childPaths.map((path) => {
          const child = index.byPath.get(path)!;
          return (
            <li key={path}>
              <NodeLink path={path} className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800/60">
                <NodeIcon type={child.type} />
                <span className="min-w-0 flex-1 truncate">{child.name}</span>
                <span className="shrink-0 text-xs tabular-nums text-slate-500 dark:text-slate-400">
                  {child.type === "folder" ? `${child.childPaths.length} el. · ` : ""}
                  {formatSize(child.size)}
                </span>
              </NodeLink>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
