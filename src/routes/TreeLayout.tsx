import { useEffect, useMemo } from "react";
import { Navigate, Outlet, useParams, useSearchParams } from "react-router-dom";
import { SearchBox } from "../components/SearchBox";
import { SearchResults } from "../components/SearchResults";
import { TreeView } from "../components/TreeView";
import { ancestorPaths, ROOT_PATH } from "../domain/paths";
import { searchTree } from "../domain/search";
import type { TreeIndex } from "../domain/types";
import { visibleRows } from "../domain/visibleRows";
import { useExpanded } from "../state/useExpanded";
import { useTree } from "../state/useTree";

export function TreeLayout() {
  const { index } = useTree();
  if (!index) {
    return <Navigate to="/" replace state={{ notice: "Najpierw wczytaj plik JSON z drzewem katalogów." }} />;
  }
  return <TreeWorkspace index={index} />;
}

function TreeWorkspace({ index }: { index: TreeIndex }) {
  // Layout widzi też parametry trasy-dziecka. Na /tree (trasa index) nodePath nie ma, więc wybrany jest root.
  const { nodePath: selectedPath = ROOT_PATH } = useParams();

  // Fraza wyszukiwania żyje w URL (?q=), dzięki czemu wyniki przetrwają odświeżenie i można je linkować.
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const results = useMemo(() => searchTree(index, query), [index, query]);
  const searching = query.trim() !== "";

  const setQuery = (value: string) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value) next.set("q", value);
        else next.delete("q");
        return next;
      },
      { replace: true },
    );
  };

  const { expanded, toggle, expand } = useExpanded();
  const rows = useMemo(() => visibleRows(index, expanded), [index, expanded]);

  // Po przejściu do węzła (kliknięcie, link, odświeżenie) odsłaniamy go w drzewie.
  useEffect(() => {
    const node = index.byPath.get(selectedPath);
    if (!node) return;
    const toOpen = ancestorPaths(node.path).filter((p) => p !== ROOT_PATH);
    if (node.type === "folder" && node.path !== ROOT_PATH) toOpen.push(node.path);
    expand(toOpen);
  }, [index, selectedPath, expand]);

  return (
    <div className="mx-auto grid w-full max-w-7xl flex-1 gap-4 px-4 py-4 md:grid-cols-[minmax(16rem,22rem)_1fr]">
      <aside className="panel flex max-h-[45dvh] min-h-0 flex-col gap-3 p-3 md:sticky md:top-4 md:max-h-[calc(100dvh-6rem)]">
        <SearchBox value={query} onChange={setQuery} />
        {searching ? (
          <SearchResults index={index} query={query} results={results} selectedPath={selectedPath} />
        ) : (
          <div className="min-h-0 overflow-y-auto">
            <TreeView index={index} rows={rows} expanded={expanded} selectedPath={selectedPath} onToggle={toggle} />
          </div>
        )}
      </aside>
      <main className="flex min-w-0 flex-col gap-4">
        <Outlet />
      </main>
    </div>
  );
}
